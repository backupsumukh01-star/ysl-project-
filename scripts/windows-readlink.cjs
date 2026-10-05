const fs = require("fs");

function asEINVAL(error, path) {
  if (!error || error.code !== "EISDIR") return error;
  const wrapped = new Error("EINVAL: invalid argument, readlink");
  wrapped.code = "EINVAL";
  wrapped.syscall = "readlink";
  wrapped.path = path;
  return wrapped;
}

const readlinkSync = fs.readlinkSync;
fs.readlinkSync = function patchedReadlinkSync(path, options) {
  try {
    return readlinkSync.call(fs, path, options);
  } catch (error) {
    throw asEINVAL(error, path);
  }
};

const readlink = fs.readlink;
fs.readlink = function patchedReadlink(path, options, callback) {
  const done = (cb) => (error, result) => {
    if (error) cb(asEINVAL(error, path));
    else cb(null, result);
  };
  if (typeof options === "function") return readlink.call(fs, path, done(options));
  return readlink.call(fs, path, options, done(callback));
};

const readlinkPromise = fs.promises.readlink.bind(fs.promises);
fs.promises.readlink = async function patchedReadlinkPromise(path, options) {
  try {
    return await readlinkPromise(path, options);
  } catch (error) {
    throw asEINVAL(error, path);
  }
};
