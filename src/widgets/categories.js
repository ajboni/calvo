const blessed = require("blessed");
const contrib = require("blessed-contrib");
const Layout = require("../layout");
const store = require("../store");

var CategoriesWidget = function make(grid, x, y, xSpan, ySpan) {
  const categoriesWidget = grid.set(y, x, ySpan, xSpan, blessed.list, {
    label: "Categories",
    mouse: true,
    scrollbar: {
      // ch: " ",
      // inverse: true,
    },

    interactive: true,
    keys: true,
    padding: { left: 1, right: 1 },
    style: {
      selected: {
        bg: "#4d5e4d",
        fg: "#f0f0f0",
        bold: true,
      },
      focus: {
        border: { fg: "red" },
        enabled: false,
        selected: {
          bg: "#689d6a",
          fg: "#f0f0f0",
          bold: true,
        },
      },
    },
  });

  //  It might be a bug in blessed, but, if I set the items on the constructor, the items duplicate when changing screens.
  categoriesWidget.setItems(store.pluginCategories);

  categoriesWidget.key("home", function (ch, key) {
    categoriesWidget.select(0);
  });

  categoriesWidget.key("end", function (ch, key) {
    categoriesWidget.select(categoriesWidget.items.length - 1);
  });
  categoriesWidget.key("pageup", function (ch, key) {
    categoriesWidget.move(-store.app.SETTINGS.SCROLL_AMMOUNT);
  });

  categoriesWidget.key("pagedown", function (ch, key) {
    categoriesWidget.move(store.app.SETTINGS.SCROLL_AMMOUNT);
  });

  categoriesWidget.on("select", function (cat, index) {
    store.setCategoryFilter(cat.content);
    Layout.focusNext();
  });

  return categoriesWidget;
};

module.exports = CategoriesWidget;
