import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import * as httpStatus from '../../../config/constants/httpStatus.js';
import * as secrets from '../../../config/constants/secrets.js';
import UserRepository from "../repository/UserRepository.js";
import UserException from '../exception/UserException.js';

class UserService {

    async createUser(req) {
        try {
          let userData = req.body;
          const { transactionid, serviceid } = req.headers;
          console.info(
            `Request to POST new USER with data ${JSON.stringify(
                userData
            )} | [transactionID: ${transactionid} | serviceID: ${serviceid}]`
          );
          this.validateUserData(userData);
          
          let user = await UserRepository.findByEmail(userData.email);
          this.userAlreadyExists(user);

          await UserRepository.create(userData);
          let response = {
            status: httpStatus.SUCCESS,
            message: 'User created successfully'
          };          
          console.info(
            `Response to POST created user with data ${JSON.stringify(
              response
            )} | [transactionID: ${transactionid} | serviceID: ${serviceid}]`
          );
          return response;
        } catch (err) {
          return {
            status: err.status ? err.status : httpStatus.INTERNAL_SERVER_ERROR,
            message: err.message,
          };
        }
      }

      validateUserData(data) {
        if (!data) {
            throw new UserException(httpStatus.BAD_REQUEST, "The name, email and password must be informed.");
        }        
        if (!data.name) {
          throw new UserException(httpStatus.BAD_REQUEST, "The name must be informed.");
        }
        if (!data.email) {
            throw new UserException(httpStatus.BAD_REQUEST, "The email must be informed.");
        }
        if (!data.password) {
          throw new UserException(httpStatus.BAD_REQUEST, "The password must be informed.");
        }       
        if (!data.admin) {
          throw new UserException(httpStatus.BAD_REQUEST, "The admin must be informed.");
        }                    
      }

    async findByEmail(req) {
        try {
            const { email } = req.params;
            const { authUser } = req;
            this.validateRequestData(email);
            let user = await UserRepository.findByEmail(email);
            this.validateUserNotFound(user);

            this.validaAuthenticateUser(user, authUser);
            return {
                status: httpStatus.SUCCESS,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    admin: user.admin,
                }
            }
        } catch (err) {
            return {
                status: err.status ? err.status : httpStatus.INTERNAL_SERVER_ERROR,
                message: err.message,
              };
        }
    }

    async findAll(req) {
        try {
          const { transactionid, serviceid } = req.headers;
          console.info(
            `Request to GET all users | [transactionID: ${transactionid} | serviceID: ${serviceid}]`
          );          
            let users = await UserRepository.findAll();
            if (!users) {
              throw new UserException(httpStatus.BAD_REQUEST, "No users were found.");
            }
            let response = {
              status: httpStatus.SUCCESS,
              users,
            };
            return response;           
        } catch (err) {
            return {
              status: err.status ? err.status : httpStatus.INTERNAL_SERVER_ERROR,
              message: err.message,
              };
        }
    }


    validateRequestData(email) {
        if(!email) {
            throw new UserException(
                httpStatus.BAD_REQUEST,
                'User email was not informed.'
            );
        }
    }

    validateUserNotFound(user){
        if(user === null || !user){
            throw new UserException(httpStatus.BAD_REQUEST, 'User was not found.')
        }
    }
    
    userAlreadyExists(user){
      if(user !== null){
          throw new UserException(httpStatus.FORBIDDEN, 'User already exists')
      }
    } 

    validaAuthenticateUser(user, authUser) {
        if(!authUser || user.id !== authUser.id){
            throw new UserException(httpStatus.FORBIDDEN, 'You cannot see this user data.');
        }
    }
    /*
    checksPermissionToRegisterAnother(authUser) {
      if(authUser.admin === false){
          throw new UserException(httpStatus.FORBIDDEN, 'You are not allowed to register a new user');
      }
    }
    */

    async getAccessToken(req) {
        try {
            const { transactionid, serviceid } = req.headers;
            console.info(
              `Request to POST login with data ${JSON.stringify(
                req.body
              )} | [transactionID: ${transactionid} | serviceID: ${serviceid}]`
            );

            const { email, password } = req.body;
            this.validateAccessTokenData(email, password);
            let user = await UserRepository.findByEmail(email);
            
            if(!user)
            throw new UserException(
                httpStatus.UNAUTHORIZED,
                'User email not found.'
            );

            this.validateUserNotFound(user);
            await this.validatePassword(password, user.password);
            const authUser = {id: user.id, name: user.name, email: user.email, admin: user.admin};
            const accessToken = jwt.sign({authUser}, secrets.API_SECRET, { expiresIn: '1d' });

            let response =  {
                status: httpStatus.SUCCESS,
                accessToken
            };

            console.info(
                `Response to POST login with data ${JSON.stringify(
                  response
                )} | [transactionID: ${transactionid} | serviceID: ${serviceid}]`
              );

            return response;
        } catch (err) {
            return {
                status: err.status ? err.status : httpStatus.INTERNAL_SERVER_ERROR,
                message: err.message,
              };
        }
    }

    validateAccessTokenData(email, password) {
        if(!email || !password) {
            throw new UserException(httpStatus.UNAUTHORIZED, 'Email and password must be informed');
        }
    }

    async validatePassword(password, hashPassword) {
        if(!(await bcrypt.compare(password, hashPassword))) {
            throw new UserException(httpStatus.UNAUTHORIZED, "Password doesn't match.");
        }
    }

}

export default new UserService();