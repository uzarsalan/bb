import babel, { defineRolldownBabelPreset } from "@rolldown/plugin-babel";

const linguiMacroPreset = defineRolldownBabelPreset({
  preset: () => ({ plugins: ["@lingui/babel-plugin-lingui-macro"] }),
  rolldown: {
    filter: { code: /@lingui\/(?:core|react)\/macro/ },
  },
});

export function linguiMacro() {
  return babel({ presets: [linguiMacroPreset] });
}
