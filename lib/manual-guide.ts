export type ManualPart =
  | { kind: "p"; text: string }
  | { kind: "strong"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "sublist"; items: string[] }
  | { kind: "steps"; items: string[] }
  | { kind: "table"; headers: string[]; rows: string[][] }
  | { kind: "img"; name: string };

export type ManualArticle = {
  id: string;
  title: string;
  preview: string;
  parts: ManualPart[];
};

export type ManualGroup = {
  title: string;
  articles: ManualArticle[];
};

export const manualGroups: ManualGroup[] = [
  {
    title: "Getting Started",
    articles: [
      {
        id: "what-you-need",
        title: "What You Need",
        preview: "In order to be able to create your lipstick shades, this is what you need: Rouge Sur Mesure device, Colour universe of 3 Cartridges, Smartphone complying with…",
        parts: [
          { kind: "p", text: "In order to be able to create your lipstick shades, this is what you need:" },
          { kind: "list", items: ["Rouge Sur Mesure device", "Colour universe of 3 Cartridges", "Smartphone complying with following minimum technical requirements:"] },
          { kind: "sublist", items: ["iPhone: minimum iPhone 6 (or later generations) with iOS 13 or above", "Android: Android 8.0 with Bluetooth 4.2 or higher"] },
        ],
      },
      {
        id: "unboxing",
        title: "Unboxing and preparing your system",
        preview: "Rouge Sur Mesure comes with the following components: Top shelf: Device Body…",
        parts: [
          { kind: "p", text: "Rouge Sur Mesure comes with the following components:" },
          { kind: "img", name: "unboxing-components.jpg" },
          { kind: "p", text: "Top shelf:" },
          { kind: "list", items: ["Device Body", "Compact", "Travel caps (pre-attached to the compact and device body)"] },
          { kind: "p", text: "Bottom shelf:" },
          { kind: "list", items: ["Lip Brush", "Travel pouch", "Charging cable", "Quick Start Guide and Safety Guide"] },
          { kind: "strong", text: "Tip: To access the bottom shelf, lift the top shelf using the two ribbon loops located at each end of the device box." },
          { kind: "img", name: "unboxing-bottom-shelf.jpg" },
          { kind: "strong", text: "IMPORTANT: the colour cartridges are sold separately. You can choose from 9 different colour universes to play with your favorite lip shades." },
        ],
      },
      {
        id: "assemble",
        title: "Assemble the device",
        preview: "The compact comes with a bottom part for on-the-go use that must be removed before attaching it onto the device for shade dispensing. Please store the bottom…",
        parts: [
          { kind: "p", text: "The compact comes with a bottom part for on-the-go use that must be removed before attaching it onto the device for shade dispensing." },
          { kind: "img", name: "assemble-remove-bottom.jpg" },
          { kind: "p", text: "Please store the bottom part to re-attach it for future on-the-go compact use. As the cap is securely attached, it might require a bit of force to unclip the cap from device." },
          { kind: "img", name: "assemble-remove-cap.jpg" },
          { kind: "p", text: "The device comes with a protection cap to keep it clean when not used or for traveling. Please remove it before attaching the compact onto the device. As the cap is securely attached, it might require a bit of force to unclip the cap from device." },
          { kind: "strong", text: "Important: Make sure you keep both, the compact bottom part to take your compact on-the-go for retouch during the day as well as the device protective cap to keep it clean when not used or safely transport it for travelling." },
        ],
      },
      {
        id: "attach-compact",
        title: "Attaching compact to device body",
        preview: "You can now attach the compact to the device body. Make sure that the compact’s logo faces the device’s power button when attaching it.",
        parts: [
          { kind: "p", text: "You can now attach the compact to the device body." },
          { kind: "img", name: "attach-compact.jpg" },
          { kind: "p", text: "Make sure that the compact’s logo faces the device’s power button when attaching it. The magnetic attachment should snap both pieces into place." },
          { kind: "p", text: "Ensure that the alignment grooves at the bottom of the compact line up with those on the top of the device by wiggling the compact from side to side until it locks into place. When the alignment grooves fit correctly, you should not be able to twist the compact in either direction." },
        ],
      },
      {
        id: "attach-brush",
        title: "Attaching lip brush to device body",
        preview: "Your lip brush can be attached to the back of the device for safe-keeping. A magnetic attachment will hold it into place.",
        parts: [
          { kind: "img", name: "attach-lip-brush.jpg" },
          { kind: "p", text: "Your lip brush can be attached to the back of the device for safe-keeping. A magnetic attachment will hold it into place." },
          { kind: "p", text: "The retracting system of the lip brush allows easy use when open and safe storage when not used. Please make sure to clean the brush of any formula residue before retracting to close." },
        ],
      },
      {
        id: "controls",
        title: "Device Controls On/Off",
        preview: "Turn on your device by holding the power button for 3 seconds until button alight.",
        parts: [
          { kind: "img", name: "power-button.jpg" },
          { kind: "p", text: "Turn on your device by holding the power button for 3 seconds until button alight. To turn off, press and hold the power button for 3 seconds. The device automatically go into standby mode after 3 minutes to preserve battery life." },
        ],
      },
      {
        id: "charging",
        title: "Charging device",
        preview: "Your device comes pre-charged and ready to use. In order to maintain optimum performance, please ensure that the device is well charged at all times.",
        parts: [
          { kind: "p", text: "Your device comes pre-charged and ready to use. In order to maintain optimum performance, please ensure that the device is well charged at all times. When charging button turns yellow, the battery is low and the device needs to be charged. A fully charged battery will last at least 1 month when kept in standby mode. You can monitor the battery percentage in the app from the Device Manager" },
          { kind: "img", name: "charging-cable.jpg" },
          { kind: "p", text: "To charge your device, use the USB-C cord provided and connect your device to a USB wall adaptor. When properly charging, the power button LED will pulse in white." },
          { kind: "strong", text: "Important: A USB-A wall charger with 5V and 1A characteristics is recommended." },
        ],
      },
      {
        id: "pairing",
        title: "Pairing Device",
        preview: "To use the device, it must be paired with the Rouge Sur Mesure app. First make sure you download the Rouge Sur Mesure application.",
        parts: [
          { kind: "p", text: "To use the device, it must be paired with the Rouge Sur Mesure app. First make sure you download the Rouge Sur Mesure application, available on the App Store or on Google Play." },
          { kind: "img", name: "pairing-device.jpg" },
          { kind: "p", text: "Upon downloading the app, you can create your account or log into an existing YSL Beauty customer account. Then, follow the onscreen instructions to pair your device during the onboarding flow." },
          { kind: "p", text: "To pair another device after the first onboarding, go to the Device Manager. Then select Advanced Settings > Add a New Device and follow the onscreen instructions." },
        ],
      },
      {
        id: "loading-cartridges",
        title: "Loading Cartridges",
        preview: "After pairing your device, you can load a colour universe.",
        parts: [
          { kind: "p", text: "After pairing your device, you can load a colour universe." },
          { kind: "img", name: "loading-cartridge-hatch.jpg" },
          { kind: "p", text: "The cartridge hatch is located at the bottom of the device, following the arrow indicators at the bottom of the device, place your thumb near the USB port and twist open the lid counter-clockwise to reveal the three cartridge ports." },
          { kind: "img", name: "remove-cartridge-cap.jpg" },
          { kind: "p", text: "Make sure to you remove the safety seal and the protective cap from each cartridge before inserting them. To reduce contamination risk, be careful to not touch the dispensing tip once the cap is removed. Keep the caps to close the cartridges in case you want to switch to another colour universe." },
          { kind: "img", name: "insert-cartridges.jpg" },
          { kind: "p", text: "Carefully insert the cartridge into any open cartridge port until it clicks into place. Repeat these steps until all three cartridges are loaded into your device. If a cartridge will not insert fully, slightly rotate it to the left or right until it clicks into place. Then, securely close the cartridge hatch lid (the hatch must be fully closed in order for the device to power back on). Once closed, the application will automatically recognize the cartridges loaded into the device." },
          { kind: "strong", text: "Important: For safety reasons, the application tracks the date of the first insertion of each cartridge - the expiration date is 2 years after the opening of the cartridge. After this date, the cartridge will be expired and it will need to be replaced." },
        ],
      },
      {
        id: "calibrating",
        title: "Calibrating Cartridges",
        preview: "Every time a new cartridge or colour universe is loaded into the device, it will need to go through a calibration flow.",
        parts: [
          { kind: "p", text: "Every time a new cartridge or colour universe is loaded into the device, it will need to go through a calibration flow. Calibration helps initiate the flow of formula in the cartridge so that it dispenses with the highest accuracy." },
          { kind: "p", text: "Upon loading a new cartridge or colour universe, the app will recognize if calibration is required and will show a pop-up to allow you to initiate calibration. If loading a cartridge that has previously been inserted into a device, the calibration flow will initiate in order to flush out any remaining formula from the previously installed cartridge." },
        ],
      },
    ],
  },
  {
    title: "The Essentials",
    articles: [
      {
        id: "create-shade",
        title: "Create a Shade",
        preview: "There are many ways to dispense a shade from the app. For details on the various methods, please see the Creating a Color section.",
        parts: [
          { kind: "p", text: "There are many ways to dispense a shade from the app. For details on the various methods, please see the Creating a Color section." },
          { kind: "img", name: "create-shade-try-on.jpg" },
          { kind: "p", text: "The virtual try-on experience allows you to digitally try on the shade before creating it live. When you commit to a shade, the shade recipe is sent to the device to dispense the exact combination of cartridges for your selected shade." },
          { kind: "strong", text: "Important: Make sure to open the compact before dispensing any shade to avoid formula transfer on the mirror." },
          { kind: "img", name: "confirm-dispense.jpg" },
        ],
      },
      {
        id: "dispense-volume",
        title: "Adjust Dispense Volume",
        preview: "The volume for each dispensed can be adjusted based on the size of your lips and the number of applications you want to achieve.",
        parts: [
          { kind: "p", text: "The volume for each dispensed can be adjusted based on the size of your lips and the number of applications you want to achieve." },
          { kind: "img", name: "adjust-dispense-volume.jpg" },
          { kind: "p", text: "To adjust the volume based on your lip size, go to Dispense Settings. Use the slider to adjust the default volume of each shade you create." },
          { kind: "img", name: "dispense-quantity.jpg" },
          { kind: "p", text: "You can perform a print test to evaluate whether the volume is suitable for your needs." },
          { kind: "p", text: "You can also adjust the amount of applications dispensed for a single shade. When you are ready to dispense a shade, hold down on the Create button until a slider appears. You can select your chosen volume from the following options:" },
          { kind: "list", items: ["Trial (perfect for a small swatch before a full dispense)", "1 application", "2 applications", "3 applications"] },
        ],
      },
      {
        id: "mix-apply",
        title: "Mix and Apply a Shade",
        preview: "Upon dispensing a shade, the formula needs to be thoroughly mixed using the applicator brush before it can be applied.",
        parts: [
          { kind: "img", name: "mix-and-apply.jpg" },
          { kind: "p", text: "Upon dispensing a shade, the formula needs to be thoroughly mixed using the applicator brush before it can be applied. To get the perfect color selected, please make sure to have a clean dispensing cup without any previous formula residue remaining." },
        ],
      },
      {
        id: "led",
        title: "Power button LED indicators",
        preview: "",
        parts: [
          {
            kind: "table",
            headers: ["LED Color", "LED Behaviour", "Device Status"],
            rows: [
              ["White", "Solid light", "Device ready"],
              ["White", "Dimming occasionally", "Idle mode"],
              ["White", "Blinking", "Charging"],
              ["Blue", "Solid light", "Bluetooth pairing mode"],
              ["Yellow", "Blinking", "Low battery"],
            ],
          },
        ],
      },
    ],
  },
  {
    title: "Managing Cartridges",
    articles: [
      {
        id: "colour-universes",
        title: "9 Colour Universes",
        preview: "Rouge Sur Mesure is compatible with 9 colour universes designed by YSL color experts, based on combinations of different colour cartridges. The colour universes can dispense thousands of shades spanning a vast lip colour spectrum.",
        parts: [
          { kind: "p", text: "Rouge Sur Mesure is compatible with 9 colour universes designed by YSL color experts, based on combinations of different colour cartridges. The colour universes can dispense thousands of shades spanning a vast lip colour spectrum." },
          { kind: "img", name: "colour-universes.jpg" },
          { kind: "strong", text: "Important: if you load an invalid cartridge combination, the app will recognize a mismatch and ask you to correct it." },
        ],
      },
      {
        id: "cartridge-status",
        title: "Monitoring Cartridge Status",
        preview: "From the application, the Cartridge Manager allows you to monitor the status of each of your cartridges, including the fill level (%) and expiration date.",
        parts: [
          { kind: "p", text: "From the application, the Cartridge Manager allows you to monitor the status of each of your cartridges, including the fill level (%) and expiration date." },
          { kind: "img", name: "cartridge-status.jpg" },
        ],
      },
      {
        id: "swapping",
        title: "Swapping Cartridges",
        preview: "You can use and reuse multiple colour universes with your Rouge Sur Mesure device.",
        parts: [
          { kind: "p", text: "You can use and reuse multiple colour universes with your Rouge Sur Mesure device." },
          { kind: "p", text: "In order to switch from one colour universe to another:" },
          { kind: "img", name: "swap-cartridges.jpg" },
          { kind: "p", text: "Open the cartridge hatch lid to reveal the three loaded cartridges. To remove a cartridge, press the ejection button. We advise to press the ejection button while retaining the cartridge ejected with your hand." },
          { kind: "p", text: "Pull the cartridge from the canal and wipe any formula residue from the tip before placing the cap back on the cartridge to protect it when not installed in the device. Please store in a cool, dry place to preserve the integrity of the formula. Repeat these steps for all cartridges that will be swapped. To install a new colour universe, follow the instructions in the Loading Cartridges section." },
        ],
      },
    ],
  },
  {
    title: "Creating a Color",
    articles: [
      {
        id: "inspired",
        title: "Getting Inspired",
        preview: "Your discovery page is your place of inspiration to view new content and suggested shades by the YSL Beauty experts and by the Rouge Sur Mesure community.",
        parts: [
          { kind: "strong", text: "Important: Make sure to open the compact before dispensing any shade to avoid formula transfer on the mirror." },
          { kind: "p", text: "Your discovery page is your place of inspiration to view new content and suggested shades by the YSL Beauty experts and by the Rouge Sur Mesure community. Keep checking the page for new updates and to keep up to date on trends, try them on, and recreate them on the spot." },
        ],
      },
      {
        id: "shade-wheel",
        title: "Color Creator - Shade Wheel",
        preview: "Feel the freedom to explore all the possible shades that can be created with your installed cartridge set. Tip 1: Find good lighting & maximize the phone screen brightness",
        parts: [
          { kind: "strong", text: "Important: Make sure to open the compact before dispensing any shade to avoid formula transfer on the mirror." },
          { kind: "p", text: "Feel the freedom to explore all the possible shades that can be created with your installed cartridge set." },
          { kind: "strong", text: "Tip 1: Find good lighting & maximize the phone screen brightness" },
          { kind: "p", text: "For the best virtual try-on experience, good natural lighting is key - you'll have a clearer image and the colors you're trying on will look more realistic. Strong backlight or artificial lighting can impact the accuracy of virtual try-on mode." },
          { kind: "img", name: "shade-wheel.jpg" },
          { kind: "strong", text: "Tip 2: Try on bare lips" },
          { kind: "p", text: "To achieve accurate results during virtual try-on, remove any existing lip make-up. Any lip shades worn on your lips can distort the accuracy of the colors shown." },
        ],
      },
      {
        id: "shade-match",
        title: "Color Creator - Shade Match",
        preview: "Shade Match uses the power of artificial intelligence to replicate the colors you see in real life into a lip shade.",
        parts: [
          { kind: "strong", text: "Important: Make sure to open the compact before dispensing any shade to avoid formula transfer on the mirror." },
          { kind: "p", text: "Shade Match uses the power of artificial intelligence to replicate the colors you see in real life into a lip shade." },
          { kind: "img", name: "shade-match.jpg" },
          { kind: "p", text: "Take a photo of your target object, then use the color picker to select the exact color you want to match." },
          { kind: "img", name: "shade-match-object.jpg" },
          { kind: "p", text: "The application will search all Rouge Sur Mesure shade universes to find the closest color match. If found, you can virtually try it on and dispense it on the spot. If the shade cannot be recreated by existing Rouge Sur Mesure color sets, you have the option to submit the shade to the YSL Beauty team for future development." },
          { kind: "strong", text: "Tip: Find good lighting & maximize the phone screen brightness for the best results in Shade Match" },
        ],
      },
      {
        id: "shade-stylist",
        title: "Color Creator - Shade Stylist",
        preview: "The Shade Stylist allows you to bring a YSL color expert with you, combining the measurement of your skintone and undertone and a photo capture of you.",
        parts: [
          { kind: "p", text: "The Shade Stylist allows you to bring a YSL color expert with you. Combining the measurement of your skintone and undertone and a photo capture of you." },
          { kind: "img", name: "shade-stylist.jpg" },
        ],
      },
    ],
  },
  {
    title: "Curating your Shade Collections",
    articles: [
      {
        id: "shade-closet",
        title: "Shade Closet",
        preview: "The Shade Closet allows you to save, name and organize your favorite shades into categories.",
        parts: [
          { kind: "p", text: "The Shade Closet allows you to save, name and organize your favorite shades into categories." },
          { kind: "img", name: "shade-closet.jpg" },
        ],
      },
    ],
  },
  {
    title: "Taking Rouge Sur Mesure on the go",
    articles: [
      {
        id: "compact-takeaway",
        title: "Compact Takeaway",
        preview: "Rouge Sur Mesure’s compact was designed to be used for lipstick retouches on-the-go. Make sure to attach the compact’s bottom before taking it away with you:",
        parts: [
          { kind: "p", text: "Rouge Sur Mesure’s compact was designed to be used for lipstick retouches on-the-go. Make sure to attach the compact’s bottom before taking it away with you:" },
          { kind: "steps", items: ["Dispense your chosen shade and mix it thoroughly", "Cleanse the lipstick brush and close your compact", "Detach the compact from the device body and remove possible formula residues with a cotton pad or clean tissue", "Attach the compact’s bottom cap onto it", "Carry your compact and applicator in the provided travel pouch"] },
          { kind: "img", name: "compact-takeaway.jpg" },
        ],
      },
      {
        id: "travelling",
        title: "Travelling with Your Device",
        preview: "To continue using Rouge Sur Mesure when travelling, please prepare the device for safe transport:",
        parts: [
          { kind: "p", text: "To continue using Rouge Sur Mesure when travelling, please prepare the device for safe transport:" },
          { kind: "img", name: "travelling-device.jpg" },
          {
            kind: "steps",
            items: [
              "From the application, go to 'Device Manager' and Enable 'Travel Mode', to lock your device from any accidental dispensing during transportation.",
              "Detach the compact from the device body",
              "Clean any formula residue from the dispensing valves with a coton pad or clean tissue.",
              "Attach the compact bottom and the device's pretective top.",
              "Place the compact and applicator inside the travel pouch.",
              "Make sure to pack Rouge Sur Mesure safely protect from bumps and impacts.",
              "Except for airplane, the cartridges don't need to be removed from the device during transportation. If you carry additional cartridges, ensure the cartridge caps are securely attached before placing them inside a bag.",
            ],
          },
          { kind: "strong", text: "Important: Traveling by air ? Please make sure to comply with the regulation by removing the cartridges from the device as it is considered as containing liquids and place the cartridges with their cap in your checked in luggage. The device can be kept in your carry on luggage." },
        ],
      },
    ],
  },
  {
    title: "Cleaning Rouge Sur Mesure",
    articles: [
      {
        id: "clean-after-use",
        title: "Cleaning after each use",
        preview: "After every use, make sure to thoroughly clean the dispensing dish and applicator with a cotton pad or clean tissue to wipe any excess formula. Do not rinse or clean the device or compact under running water, this may damage the device.",
        parts: [
          { kind: "p", text: "After every use, make sure to thoroughly clean the dispensing dish and applicator with a cotton pad or clean tissue to wipe any excess formula. Do not rinse or clean the device or compact under running water, this may damage the device." },
          { kind: "img", name: "clean-dish.jpg" },
          { kind: "img", name: "clean-brush.jpg" },
        ],
      },
      {
        id: "weekly-maintenance",
        title: "Weekly Maintenance",
        preview: "Some weekly hygiene maintenance is recommended to preserve optimum performance and hygiene. Using rubbing alcohol on a cotton pad or microfiber cloth, wipe the compact dish and mirror.",
        parts: [
          { kind: "p", text: "Some weekly hygiene maintenance is recommended to preserve optimum performance and hygiene. Using rubbing alcohol on a cotton pad or microfiber cloth, wipe the compact dish and mirror." },
          { kind: "img", name: "weekly-wipe.jpg" },
          { kind: "p", text: "Wipe the outside of the device with a microfiber cloth to clean away any dust or debris." },
          { kind: "p", text: "Wash the applicator brush using soapy lukewarm water (i.e. vegetable solid soap Marseille soap) or a makeup brush cleaning solution. Gently tap the brush on a dry cloth, being careful to not fray the bristles. Lay the brush on a cloth to allow it to fully air dry before retracting the brush into a closed position." },
          { kind: "strong", text: "Important: Only wash the tuft of the brush, avoid submerging the handle. Never store or retract a damp brush into closed position, dampness can cause mildew and destroy the tuft." },
        ],
      },
    ],
  },
  {
    title: "Tips & Tricks",
    articles: [
      {
        id: "last-recipe",
        title: "Quickly dispense your last recipe",
        preview: "You can dispense you last shade recipe by quickly double pressing the power button. Make sure the device is turned on (one quick press to wake-up the device when in standby mode, 3 seconds press to turn the device on).",
        parts: [
          { kind: "img", name: "last-recipe.jpg" },
          { kind: "p", text: "You can dispense you last shade recipe by quickly double pressing the power button. Make sure the device is turned on (one quick press to wake-up the device when in standby mode, 3 seconds press to turn the device on)." },
        ],
      },
      {
        id: "reset",
        title: "Reset the Device",
        preview: "In case of freezing or device trouble, twist open the cartridge chamber lid and reset device:",
        parts: [
          { kind: "p", text: "In case of freezing or device trouble, twist open the cartridge chamber lid and reset device:" },
          { kind: "steps", items: ["open the cartridge chamber lid", "find the pinhole RESET button on the inner side of the lid", "gently press the RESET button using a pin or a paperclip", "Close the lid and try turning on your device again"] },
          { kind: "img", name: "reset-device.jpg" },
        ],
      },
    ],
  },
  {
    title: "Useful Information & Storage",
    articles: [
      {
        id: "storage",
        title: "Useful Information & Storage",
        preview: "Keep device in a cool and dry place away from heat and direct sunlight. Note: under hot humid condition (above 40 degrees Celsius), some lipstick formula may pop out in the dispensing cup due to the product characteristics & heating.",
        parts: [
          {
            kind: "list",
            items: [
              "Keep device in a cool and dry place away from heat and direct sunlight. Note: under hot humid condition (above 40 degrees Celsius), some lipstick formula may pop out in the dispensing cup due to the product characteristics & heating. Wipe the product & move device to a cooler place.",
              "The body, compact and lip brush contain magnets. Pacemakers, defibrillators and credit cards may be affected by magnetic fields, for safety reasons avoid placing them near the mentioned items.",
            ],
          },
        ],
      },
      {
        id: "safety",
        title: "Important Safety Information",
        preview: "Do not use or hold the device with wet or damp hands. Do not expose the device to water & prevent any water from splashing onto the device.",
        parts: [
          {
            kind: "list",
            items: [
              "Do not use or hold the device with wet or damp hands. Do not expose the device to water & prevent any water from splashing onto the device. Do not use this appliance near bathtubs, shower, basins or vessels containing water. Do not leave device plugged in in proximity of water. Do not get the wall adaptor or USB cable wet.",
              "If water gets into inner part of the device, unplug the power supply immediately, turn off the device by pressing the button until indicator light is off and contact our after sales service. Do not attempt to switch the appliance back on due to electrical injury risk.",
              "Do not attempt to disassemble appliance. Unauthorized opening of the appliance automatically voids the warranty. Repairs must only be carried out by the authorized after sales service.",
              "Frequently check condition of the USB cable & power supply. Discontinue use if any damage occurs. Never operate this appliance if it has a damaged cord or plug, or if it has been dropped, damaged, or dropped into water.",
              "Never drop or insert any object other than authorized cartridges into any opening or hose.",
              "Do not expose appliance to fire or excessive temperature. Keep away from heat source and high temperature (direct sunlight, radiator, heater). Exposure to fire or temperature above 130°C may cause explosion.",
              "This device may be used by children older than 8 years old and by individuals with reduced physical, sensory or mental capacity or lacking in experience or knowledge, as long as they are properly supervised or have been given instructions for using the device safely and the risks have been taken into account. Children must not play with the device. Cleaning and maintenance must not be done by children without supervision. Keep the appliance away from pets.",
            ],
          },
        ],
      },
      {
        id: "environment",
        title: "Environmental Responsibility",
        preview: "This product is subject to separate collection of electrical and electronic equipment. At the end of its life, the appliance must be processed separately from household waste.",
        parts: [
          { kind: "p", text: "This product is subject to separate collection of electrical and electronic equipment. At the end of its life, the appliance must be processed separately from household waste. This will prevent any harmful impact on the environment or on human health due to the uncontrolled disposal of waste that can contain dangerous substances. User is responsible to return the appliance to a specific center for waste electrical and electronic appliances. For additional information regarding applicable local laws, please contact your local municipal facility." },
        ],
      },
      {
        id: "warranty",
        title: "Limited Warranty Information",
        preview: "Congratulations on your purchase! We value our customers and aim to provide the highest quality products to ensure customer satisfaction.",
        parts: [
          { kind: "p", text: "Congratulations on your purchase! We value our customers and aim to provide the highest quality products to ensure customer satisfaction. Please use this as your reference for customer service or warranty questions you may have in the future." },
          { kind: "p", text: "If you are for any reason dissatisfied with the purchase of your YSL Rouge Sur Mesure from an authorized dealer, call your regional Customer Care Service to make arrangements for the return. YSL Beauty warranty obligations are limited to the terms set out below." },
          { kind: "strong", text: "1. Limited Warranty Coverage" },
          { kind: "list", items: ["For the duration of the Warranty Period, YSL Beauty warrants the Product against defects in materials and workmanship arising from Normal Use of the Product.", "If there is a defect in the Product which is covered by this Limited Warranty, YSL Beauty agrees to exchange the Product with a new equivalent Product. This is the sole remedy available for breach of warranty."] },
          { kind: "p", text: "2. This Limited Warranty is exclusive of all other warranties, whether oral or written, express or implied. There are no implied warranties created by the manufacture, sale, or use of the Product. If YSL Beauty cannot lawfully disclaim implied warranties under this Limited Warranty, all such warranties, including warranty of merchantability and fitness for a particular purpose, are limited in duration of this Limited Warranty." },
          { kind: "strong", text: "3. How to get warranty service or for general customer service inquiries?" },
          { kind: "p", text: "In order to receive service under this Limited Warranty, please call your regional Customer Care Service." },
          { kind: "strong", text: "4. Limitations" },
          { kind: "p", text: "This warranty is limited and may be relied upon only:" },
          { kind: "list", items: ["by the original end user of YSL Beauty Product; and", "where the Product was manufactured by or for YSL Beauty and sold by an authorized distributor.", "To obtain service under this Limited Warranty, you will be required to provide YSL Beauty with original proof of purchase date.", "This Limited Warranty does not apply where the Product is subjected to use that does not constitute Normal Use, including but not limited to personal injury or property damage arising from misuse of the Product."] },
          { kind: "strong", text: "5. Exclusions" },
          { kind: "p", text: "YSL Beauty is not responsible for any indirect, incidental, special or consequential damages arising out of the use of the product, whether arising from an electrical issue, water ingress or otherwise." },
          { kind: "strong", text: "6. Validity" },
          { kind: "p", text: "This Limited Warranty is valid worldwide for a period of 2 years starting from the date of purchase. You may have different or additional rights depending on the region in which you live so the limitations in the document above may not apply to you. Refer to the regional YSL Beauty website for more information." },
          { kind: "strong", text: "7. Definitions" },
          { kind: "list", items: ["\"Normal Use\" means ordinary consumer use under normal home conditions according to the instruction manual included with the Product.", "\"Product\" means Rouge Sur Mesure."] },
        ],
      },
    ],
  },
];

export function articleText(article: ManualArticle) {
  return [
    article.title,
    article.preview,
    ...article.parts.map((part) => {
      if (part.kind === "img") return part.name;
      if (part.kind === "list" || part.kind === "sublist" || part.kind === "steps") return part.items.join(" ");
      if (part.kind === "table") return [...part.headers, ...part.rows.flat()].join(" ");
      return part.text;
    }),
  ].join(" ");
}
