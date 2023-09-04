import { Client, Collection, REST, Routes } from 'discord.js';
import { Command } from './commands';
import requireAll from 'require-all';
import path from 'path';
import Module from 'module';

export class CustomClient extends Client {
  commands: Collection<string, Command> = new Collection();
  rest = new REST();

  async login(token?: string): Promise<string> {
    token = await super.login(token);

    this.rest.setToken(token);

    return token;
  }

  async resolveModules() {
    requireAll({
      recursive: true,
      filter: /\w*.[tj]s/g,
      dirname: path.join(__dirname, './commands'),
      resolve: (model: Module & { default?: Command | false }) => {
        const command = model.default;

        if (command === false) return;
        if (!command) {
          console.log(`[Discord] command not available ${model.filename}`);
          return;
        }

        if (command.disabled) return;

        console.log(`[Discord] Command '${command.builder.name}' registered.`);
        this.commands.set(command.builder.name, command);
      },
    });

    await this.rest.put(Routes.applicationCommands(this.user?.id as string), {
      body: this.commands.map((v) => v.builder.toJSON()),
    });
  }

  async deployCommands() {}
}
