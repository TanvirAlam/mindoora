# Contribution Guidelines

When contributing to `Mindoora`, whether on GitHub or in other community spaces:

- Be respectful, civil, and open-minded.
- Before opening a new pull request, try searching through the [issue tracker](https://github.com/mindoora/mindoora-turborepo/issues) for known issues or fixes.

## How to Contribute

### Prerequisites

In order to not waste your time implementing changes that has already been declined, or is generally not needed, start by [opening an issue](https://github.com/mindoora/mindoora-turborepo/issues) describing the problem you would like to solve.

### Setup your environment

In order to contribute to this project, you will need to fork the repository:

```bash
......
```

### Implement your changes

This project is a [mindoora-web](https://github.com/mindoora/mindoora-turborepo/) monorepo. The code for the CLI is in the `cli` directory, and the docs is in the `www` directory. Now you're all setup and can start implementing your changes.

Here are some useful scripts for when you are developing:

| Command          | Description                                             |
| ---------------- | ------------------------------------------------------- |
| `pnpm dev:cli`   | Builds and starts the CLI in watch-mode                 |
| `pnpm dev:www`   | Starts the development server for the docs with HMR     |
| `pnpm build:cli` | Builds the CLI                                          |
| `pnpm build:www` | Builds the docs                                         |
| `pnpm build`     | Builds CLI and docs                                     |
| `pnpm format`    | Formats the code                                        |
| `pnpm lint`      | Lints the code                                          |
| `pnpm lint:fix`  | Lints the code and fixes any errors                     |
| `pnpm check`     | Checks your code for typeerrors, formatting and linting |

When making commits, make sure to follow the [convential commit](https://www.conventionalcommits.org/en/v1.0.0/) guidelines, i.e. prepending the message with `feat:`, `fix:`, `chore:`, `docs:`, etc...

### When you're done

Check that your code follows the project's style guidelines by running:

```bash
pnpm check
```

Please also make a manual, functional test of your changes.

If your change should appear in the changelog, i.e. it changes some behavior of either the CLI or the outputted application, it must be captured by `changeset` which is done by running

```bash
pnpm changeset
```

and filling out the form with the appropriate information. Then, add the generated changeset to git:

```bash
git add ./changeset/*.md && git commit -m "chore: add changeset"
```

When all that's done, it's time to file a pull request to upstream:

```bash
gh pr create --web
```

and fill out the title and body appropriately. Again, make sure to follow the [convential commit](https://www.conventionalcommits.org/en/v1.0.0/) guidelines for your title.

## Credits
Mindoora: 
    Contact: 
        Tanvir Alam (tanvir.alam.shawn@gmail.com)
