/**
 * Created by Jake on 12/19/2016.
 */

'use strict';
const promiseRetry = require('promise-retry');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const authConfig = require('../keys/authConfig.js');
let googleConfig = null;

if(process.env.development === 'true'){
    console.log('Using Development Google Auth Config');
    googleConfig = authConfig.googleAuthDev;
} else {
    googleConfig = authConfig.googleAuth;
}

const User = require('../models/User');

module.exports = function(passport){
    passport.serializeUser((user, done) => {
        let sessionUser = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            authType: user.authType,
            email: user.email
        };
        done(null, sessionUser);
    });

    passport.deserializeUser((sessionUser, done) => {
        done(null,sessionUser);
    });

    passport.use(new GoogleStrategy(
        googleConfig,
        (accessToken, refreshToken, profile, done) => {
            process.nextTick(() => {
                let idObj = {
                    google: {
                        id: profile.id,
                        name: profile.displayName,
                        firstName: profile.name.givenName,
                        lastName: profile.name.familyName,
                        email: profile.emails[0].value,
                        accessToken: accessToken,
                        refreshToken:  refreshToken,
                        provider: profile.provider
                    }
                };

                promiseRetry((retry, attempt) => {
                    User.findOrCreate(idObj)
                    .then((user) => {
                        done(null, user);
                    })
                    .catch(($error) => {
                      if($error.fields[0].code == 'Neo.ClientError.Schema.ConstraintValidationFailed'){
                            console.error('Duplicate User ID, retrying');
                            retry('Create User Duplicate Id');
                        } else {
                            console.error('Error: ', $error);
                            done(null,false);
                        }
                    });
                },{retries:3})
                .catch(($error) => {
                    console.error('FindOrCreate User Error: ', $error);
                    done(null,false);
                });
            });
        }
    ));
};
