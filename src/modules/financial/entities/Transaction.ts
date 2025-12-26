import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";
import { User } from "../../user/entities/User";
import { Category } from "./Category";

export enum TransactionStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  CANCELLED = "cancelled"
}

@Entity("transactions")
export class Transaction {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // Armazena em centavos (ex: R$ 150,75 = 15075)
  @Column("bigint")
  amountCents!: number;

  @Column()
  description!: string;

  @Column({ type: "date" })
  date!: Date;

  @Column({
    type: "enum",
    enum: TransactionStatus,
    default: TransactionStatus.COMPLETED
  })
  status!: TransactionStatus;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column()
  userId!: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: "categoryId" })
  category!: Category;

  @Column()
  categoryId!: string;

  @Column({ nullable: true })
  notes!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Método helper para converter para reais
  get amount(): number {
    return this.amountCents / 100;
  }

  // Método helper para setar valor em reais
  setAmount(reais: number): void {
    this.amountCents = Math.round(reais * 100);
  }
}
