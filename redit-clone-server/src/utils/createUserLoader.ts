import DataLoader from 'DataLoader';
import { User } from '../entities/User';

// DataLoader expects entity ids and
// Fetches from database & returns objects/data that correspond to the ids
// ex. expects array of ids [1,2,3], returns array of user objects[{id:1, username:"bernard"}, {}, {}]
export const createUserLoader = () => new DataLoader<number, User>(async userIds => {
    const users = await User.findByIds(userIds as number[]);
    const userIdToUser: Record<number, User> = {};
    users.forEach(user => {
        userIdToUser[user.id] = user;
    })

    return userIds.map(userId => userIdToUser[userId]);
});