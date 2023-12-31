/**
 * Created by Jake on 12/28/2016.
 */
'use strict';

class User {
    constructor($data) {
        this.data = $data || {};
    }

    //TODO: update new User() calls to use these instead
    static newUserFromGoogleIdObj($idObj){
        let user = new User();
        user.updateFromGoogleIdObj($idObj);
        return user;
    }

    static newUserFromSessionUser($sessionUser){
        let user = new User();
        user.data.userId = $sessionUser.id;
        user.data.firstName = $sessionUser.firstName;
        user.data.lastName = $sessionUser.lastName;
        user.data.authType = $sessionUser.authType;
        user.data.email = $sessionUser.email;
        return user;
    }

    updateFromGoogleIdObj($idObj) {
        this.data.firstName = $idObj.firstName;
        this.data.lastName = $idObj.lastName;
        this.data.profileImg = $idObj.profileImg;
        this.data.name = $idObj.name;
        this.data.email = $idObj.email;

        this.authType = 'google';
        this.data.google = {};
        this.data.google.id = $idObj.id;
        this.data.google.accessToken = $idObj.accessToken;
        this.data.google.refreshToken = $idObj.refreshToken;
        this.data.google.name = $idObj.name;
        this.data.google.email = $idObj.email;
        this.data.google.firstName = $idObj.firstName;
        this.data.google.lastName = $idObj.lastName;
        this.data.google.profileImg = $idObj.profileImg;
        this.data.google.provider = $idObj.provider;
    };

    get id() {
        return this.data.userId;
    }

    get authId() {
        return this.data[this.authType].id;
    }

    get name() {
        return this.data.name;
    }

    get email() {
        return this.data.email;
    }

    get authName() {
        return this.data[this.authType].name;
    }

    get fullName() {
        return (this.firstName + ' ' + this.lastName);
    }
    get firstName() {
        return this.data.firstName;
    }

    get lastName() {
        return this.data.lastName;
    }

    get profileImg(){
        return this.data.profileImg;
    }

    get authEmail() {
        return this.data[this.authType].email;
    }

    get refreshToken() {
        return this.data[this.authType].refreshToken;
    }

    get accessToken() {
        return this.data[this.authType].accessToken;
    }


    static findOrCreate($idObj) {
        if ($idObj.hasOwnProperty('google')) {
            return new Promise((resolve, reject) => {
                let newUser = new User();
                newUser.updateFromGoogleIdObj($idObj.google);
                resolve(newUser);
            });
        } else {
            //Bad login ID type
            console.error('Bad ID Type');
            throw new Error('Bad ID Type');
        }
    }
}

module.exports = User;