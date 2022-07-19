import bcrypt from 'bcrypt';

import User from "../model/User.js";

class UserRepository {

    async create(user){
        try {
            let password = await bcrypt.hash(user.password, 10);
            user.password = password;
            await User.create(user);
        } catch (err) {
            console.error(err.message);
            return null;
        }
    }   
        
    async findById(id){
        try {
            return await User.findOne({where: { id }})
        } catch (err) {
            console.error(err.message);
            return null;
        }
    } 

    async findByEmail(email){
        try {
            return await User.findOne({where: { email }})
        } catch (err) {
            console.error(err.message);
            return null;
        }
    }

    async findAll(){
        try {
            return await User.findAll({attributes: ['id', 'name', 'email', 'admin']});
        } catch (err) {
            console.error('ERRO AO LISTAR TODOS OS USUÁRIOS', err.message);
            return null;
        }
    }    

}

export default new UserRepository();