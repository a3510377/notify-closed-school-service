import { BaseEntity, Column, Entity } from 'typeorm';

@Entity({ name: 'discord' })
export class DiscordModel extends BaseEntity {
  @Column({ unique: true, primary: true })
  channelID!: string;

  @Column()
  guildID!: string;

  @Column({ default: '*' })
  city!: string;
}

export const discordFindOrCreate = async (
  channelID: string,
  guildID: string,
) => {
  await DiscordModel.upsert({ channelID, guildID }, ['channelID']);

  return await DiscordModel.findOneBy({ channelID });
};
