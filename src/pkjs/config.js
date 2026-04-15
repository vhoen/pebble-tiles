module.exports = [
  {
    type: "heading",
    defaultValue: "Pebble Tiles"
  },
  {
    type: "text",
    defaultValue: "Configure the hints display."
  },
  {
    type: "section",
    items: [
      {
        type: "toggle",
        messageKey: "DisplayHint",
        label: "Display hints",
        defaultValue: true
      },
      {
        type: "toggle",
        messageKey: "UseAMPM",
        label: "Use AM/PM bottom hints",
        description: "On: left + top + bottom, Off: left + top + right",
        defaultValue: false
      }
    ]
  },
  {
    type: "submit",
    defaultValue: "Save"
  }
];
