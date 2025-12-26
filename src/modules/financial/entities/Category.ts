import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

export enum TransactionType {
  INCOME = "income",
  EXPENSE = "expense"
}

@Entity("categories")
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column()
  slug!: string;

  @Column({
    type: "enum",
    enum: TransactionType
  })
  type!: TransactionType;

  @Column({ nullable: true })
  icon!: string;

  @Column({ nullable: true })
  color!: string;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
