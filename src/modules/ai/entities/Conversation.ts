import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "../../user/entities/User";

@Entity("conversations")
export class Conversation {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  user_id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column()
  question!: string;

  @Column("text")
  response!: string;

  @Column({ default: "chat" })
  type!: "chat" | "report" | "analysis"; // Tipo de interação

  @CreateDateColumn()
  createdAt!: Date;
}
