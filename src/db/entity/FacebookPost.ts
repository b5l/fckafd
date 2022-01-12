import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import FacebookPage from './FacebookPage';

@Entity()
export default class FacebookPost {
    @PrimaryGeneratedColumn() id: number;
    @Column() public url: string;
    @Column() public identifier: string;
    @Column() public deleted: boolean;

    @CreateDateColumn() public createdAt: Date;

    // relations
    @ManyToOne(
        () => FacebookPage,
        page => page.posts
    ) facebookPage: FacebookPage;
}
