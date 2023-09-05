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
