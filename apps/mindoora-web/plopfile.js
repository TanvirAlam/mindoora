module.exports = function (plop) {
  plop.setGenerator("component", {
    description: "Create a component",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is this component's name?",
      }
    ],
    actions: [
      {
        type: "add",
        path: "src/components/ui/features/{{pascalCase name}}/{{pascalCase name}}.tsx",
        templateFile: "templates/temp-comp.tsx.hbs",
      },
      {
        type: "add",
        path: "src/components/ui/features/{{pascalCase name}}/{{pascalCase name}}.test.tsx",
        templateFile: "templates/temp-test.tsx.hbs",
      },
      {
        type: "add",
        path: "src/components/ui/features/{{pascalCase name}}/{{pascalCase name}}.stories.tsx",
        templateFile: "templates/temp-stories.tsx.hbs",
      },
      {
        type: "add",
        path: "src/components/ui/features/{{pascalCase name}}/{{pascalCase name}}.styled.tsx",
        templateFile: "templates/temp-styled.tsx.hbs",
      },
      {
        type: "add",
        path: "src/components/ui/features/{{pascalCase name}}/index.ts",
        templateFile: "templates/temp-index.tsx.hbs",
      }
    ],
  });
};
