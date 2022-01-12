import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import FacebookPost from './FacebookPost';

@Entity()
export default class FacebookPage {
    @PrimaryGeneratedColumn() id: number;
    @Column() pageId: string;

    // relations
    @OneToMany(
        () => FacebookPost,
        post => post.facebookPage
    ) posts: FacebookPost[];
}
