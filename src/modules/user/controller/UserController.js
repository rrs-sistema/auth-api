import UserService from '../service/UserService.js';

class UserController {

    async createUser(req, res) {
        let user = await UserService.createUser(req);
        return res.status(user.status).json(user);
    }

    async getAccessToken(req, res) {
        let accessToken = await UserService.getAccessToken(req);
        return res.status(accessToken.status).json(accessToken);
    }

    async findByEmail(req, res){
        let user = await UserService.findByEmail(req);
        return res.status(user.status).json(user);
    }

    async findAll(req, res) {
        let order = await UserService.findAll(req);
        return res.status(order.status).json(order);
    }   
}

export default new UserController();