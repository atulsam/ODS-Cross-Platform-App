import { Injectable } from '@angular/core';
import Axios from "axios";
import {url, getType, getTypeFromUri} from './constants';

@Injectable({
  providedIn: 'root'
})

export class APICallsService {

  constructor() { }

  FETCH_TIMEOUT : number = 10000;


  axios = Axios.create({
    timeout: this.FETCH_TIMEOUT,
    headers: {
      Accept: 'application/json',
    'Content-Type': 'application/json'
    }
  });


  public statusHandle(response, callback){
    //console.log(response)
    const statusFirstDigit = Math.floor(response.status/100);
    if(statusFirstDigit < 3){
      // 100-200 success code=
      callback(response.data);
    }else
    if(statusFirstDigit < 5){
      // 300-499 redirect/user error code
      callback(`${response.status} ${response.statusText}`);
    }else{
      // 500 error code
      if(response.name == "PermissionDenied" /*&& store.getState().login*/){                  // ################
        if (window.confirm('You have been logged out. Login again?'))                         // ################
        {
          // store.dispatch(logoutAction());
        }
      }
      if (response.status === 408 || response.code === 'ECONNABORTED') {
          callback(`Timeout 10000ms`)
          return;
        }
      console.log(response)
      const errorText = JSON.stringify(response.response.data);
      callback(`500${response.response.statusText} ${errorText}`);
    }
  }

  /*
    Desc: Check if current email is a user
    input: Email
    accept: (successMessage:string){}
    fail: (errorMessage:string){}
  */

  public checkLogin(email, accept, fail){
    var callback = accept;
    this.axios.post(url+'user', {
        action: 'verifyUser',
        email: email,
    }).then((response) => {
      console.log("login response", response)
      if(!(response.status === 200))
        callback = fail;
      this.statusHandle(response, callback);
    }).catch((error) => {
        this.statusHandle(error, fail);
      });
  }


  /*
    Desc: Send a code to the user
    input: Email
    accept: (successMessage:string){}
    fail: (errorMessage:string){}
  */

  public resetPasswordSendCode(email, accept, fail){
    var callback = accept;

    this.axios.post(url+'user', {
        action: 'sendVerificationCode',
        email: email
    }).then((response) => {
      if(!(response.status === 200))
        callback = fail;
      this.statusHandle(response, callback);
    }).catch((error) => {
        this.statusHandle(error, fail);
      });
  }


  /*
    Desc: Verify Code for the user
    input: Email
    accept: (successMessage:string){}
    fail: (errorMessage:string){}
  */

  public resetPasswordVerifyCode(email,code, accept, fail){
    var callback = accept;

    this.axios.post(url+'user', {
        action: 'verifyCode',
        email: email,
        code: code
    }).then((response) => {
      if(!(response.status === 200))
        callback = fail;
      this.statusHandle(response, callback);
    }).catch((error) => {
        this.statusHandle(error, fail);
      });
  }

  /*
    Desc: Send a code to the user
    input: Email
    accept: (successMessage:string){}
    fail: (errorMessage:string){}
  */

  public resetPassword(email,code,password, cpassword, accept, fail){
    var callback = accept;

    this.axios.post(url+'user', {
        action: 'setPassword',
        email: email,
        code: code,
        password: password,
        confirmPassword: cpassword
    }).then((response) => {
      if(!(response.status === 200))
        callback = fail;
      this.statusHandle(response, callback);
    }).catch((error) => {
        this.statusHandle(error, fail);
      });
  }


  /*
    Desc: Login and return a hash
    input: Email
    accept: (successMessage:string){}
    fail: (errorMessage:string){}
  */
  public login(email, password, accept, fail){
    var callback = accept;

    this.axios.post(url+'user', {
        action: 'login',
        email: email,
        password: password,
    }).then((response) => {
      if(!(response.status === 200))
        callback = fail;
      this.statusHandle(response, callback);
    })
    .catch((error) => {
        
        this.statusHandle(error, fail);
      });
  }

  public isAdmin(email, hash, accept, fail){
    var callback = accept;
    this.axios.post(url+'user', {
        action: 'isAdmin',
        email: email,
        hash: hash,
    }).then((response) => {
      if(!(response.status === 200))
        callback = fail;
      this.statusHandle(response, callback);
    })
    .catch((error) => {
        
        this.statusHandle(error, fail);
      });
  }

  public history(uri, accept, fail){
    var callback = accept;

    this.axios.post(url+'user', {
        action: 'history',
        uri: encodeURI(uri)
    }).then((response) => {
      if(!(response.status === 200))
        callback = fail;
      this.statusHandle(response, callback);
    })
    .catch((error) => {
        this.statusHandle(error, fail);
      });
  }


  public deleteHistory(uri, accept, fail){
    var callback = accept;

    this.axios.post(url+'user', {
      action: "deleteHistory",
        uri: encodeURI(uri)
    })
    .then((response) => {
      if(!(response.status === 200))
        callback = fail;
      this.statusHandle(response, callback);
    })
    .catch((error) => {
        this.statusHandle(error, fail);
      });
  }

  /*
    Desc: List credentials for dropbox and googledrive
  */
  public dropboxCredList(accept, fail){
    var callback = accept;
    this.axios.get(url+'cred?action=list')
    .then((response) => {
      if(!(response.status === 200))
        callback = fail;
      this.statusHandle(response, callback);
    })
    .catch((error) => {
        
        this.statusHandle(error, fail);
      });
  }

  /*
    Desc: Extract all transfers for the user
  */
  public queue(accept, fail){
    var callback = accept;

    this.axios.post(url+'q', {
        status: 'all'
    })
    .then((response) => {
      if(!(response.status === 200))
        callback = fail;
      this.statusHandle(response, callback);
    })
    .catch((error) => {
        fail(error);
      });
  }

  public submit(src, srcEndpoint, dest, destEndpoint, options,accept, fail){
    var callback = accept;
    var src0 = Object.assign({}, src);
    var dest0 = Object.assign({}, dest);
    if(Object.keys( src0.credential ).length == 0){
      delete src0["credential"];
    }
    if(Object.keys( dest0.credential ).length == 0){
      delete dest0["credential"];
    }

    this.axios.post(url+'submit', {
        // src: {...src0, type: getType(src0), map: getMapFromEndpoint(srcEndpoint)},        ################ TODO
        // dest: {...dest0, type: getType(dest0), map: getMapFromEndpoint(destEndpoint)},    ################ TODO
        options:options
    }).then((response) => {
      if(!(response.status === 200))
        callback = fail;
      this.statusHandle(response, callback);
    })
    .catch((error) => {
        
        this.statusHandle(error, fail);
      });
  }

  public listFiles(uri, endpoint, id, accept, fail){
    var body = {
        uri: encodeURI(uri),
        depth: 1,
        id: id,
        //map: getMapFromEndpoint(endpoint),
        type: getTypeFromUri(uri)
      };

    body = Object.keys(endpoint.credential).length > 0 ? {...body, /*credential: endpoint.credential*/} : body;      //############

    var callback = accept;
    this.axios.post(url+'ls', JSON.stringify(body))
    .then((response) => {
      if(!(response.status === 200))
        callback = fail;
        this.statusHandle(response, callback);
    })
    .catch((error) => {
        this.statusHandle(error, fail);
      });
  }

  public share(uri, endpoint, accept, fail){
    var callback = accept;

    this.axios.post(url+'share', {
        credential: endpoint.credential,
        uri: encodeURI(uri),
        type: getTypeFromUri(uri),
        // map: getMapFromEndpoint(endpoint),                    ################ TODO

    })
    .then((response) => {
      if(!(response.status === 200))
        callback = fail;
      this.statusHandle(response, callback);
    })
    .catch((error) => {
        
        this.statusHandle(error, fail);
      });
  }

  public mkdir(uri,type, endpoint,  accept, fail){
    var callback = accept;
    // const id = getIdsFromEndpoint(endpoint);       ################ TODO
    this.axios.post(url+'mkdir', {
        credential: endpoint.credential,
        uri: encodeURI(uri),
        // id: id,                                  ################3333
        type: type,
        // map: getMapFromEndpoint(endpoint),       ################ TODO
    })
    .then((response) => {
      if(!(response.status === 200))
        callback = fail;
      this.statusHandle(response, callback);
    })
    .catch((error) => {
        this.statusHandle(error, fail);
      });
  }

  public deleteCall(uri, endpoint, id, accept, fail){
    console.log("screw")
    var callback = accept;
    this.axios.post(url+'delete', {
        credential: endpoint.credential,
        uri: encodeURI(uri),
        id: id,
        type: getTypeFromUri(uri),
        // map: getMapFromEndpoint(endpoint)               ################ TODO
    })
    .then((response) => {
      if(!(response.status === 200))
        callback = fail;
      this.statusHandle(response, callback);
    })
    .catch((error) => {
        
        this.statusHandle(error, fail);
      });
  }


  public download(uri, credential){
    console.log(uri)
    this.axios.post(url+'download', {
      credential: credential,
      uri: encodeURI(uri)
    })
    .then((response) => {
      if(!(response.status === 200))
        console.log("Error in download API call");
      else{
        console.log(JSON.stringify(response));
        var form = document.createElement('form');
        form.action = response.data;
        form.target = '_blank';

        // console.log("Value contained in "+input.name+" : "+input.value);
        // console.log("Form method :" + form.method);

        form.style.display = 'none';
        document.body.appendChild(form);
        form.submit();
      }
    })
    .catch((error) => {
        console.log("Error encountered while generating download link");
    });
  }

  public upload(uri, credential, accept, fail){
    var callback = accept;

    this.axios.post(url+'share', {
        credential: credential,
        uri: encodeURI(uri),
        type: getTypeFromUri(uri)
    }).then((response) => {
      if(!(response.status === 200))
        callback = fail;
      this.statusHandle(response, callback);
    })
    .catch((error) => {
        
        this.statusHandle(error, fail);
      });
  }

  /*
    Desc: Retrieve all the available users
  */
  public getUsers(type, accept, fail){
    var callback = accept;

    this.axios.post(url+'user', {
        action: type
    })
    .then((response) => {
      if(!(response.status === 200))
        callback = fail;
      this.statusHandle(response, callback);
    })
    .catch((error) => {
        
        this.statusHandle(error, fail);
      });
  }

  /*
    Desc: Change Password
  */
  public changePassword(oldPassword, newPassword,confirmPassword, accept, fail){
    var callback = accept;

    this.axios.post(url+'user', {
      action: "resetPassword",
        password: oldPassword, 
        newPassword: newPassword,
        confirmPassword: confirmPassword

    })
    .then((response) => {
      if(!(response.status === 200))
        callback = fail;
      this.statusHandle(response, callback);
    })
    .catch((error) => {
        fail(error);
      });
  }

  public cancelJob(jobID, accept, fail){
    var callback = accept;
    fetch(url+'cancel', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        job_id: jobID
      }),
    })
    .then((response) => {
      if(!response.ok) 
        callback = fail;
      this.statusHandle(response, callback);
    })
    .catch((error) => {
        fail(error);
      });
  }

  public deleteCredential(uri, accept, fail){
    var callback = accept;

    this.axios.post(url+'user', {
      action: "deleteCredential",
        uuid: uri
    })
    .then((response) => {
      if(!(response.status === 200))
        callback = fail;
      this.statusHandle(response, callback);
    })
    .catch((error) => {
        this.statusHandle(error, fail);
      });
  }


  public restartJob(jobID, accept, fail){
    var callback = accept;
    this.axios.post(url+'restart',{
      job_id: jobID
    })
    .then((response) => {
      if(!(response.status === 200))
        callback = fail;
      this.statusHandle(response, callback);
    })
    .catch((error) => {
        
        this.statusHandle(error, fail);
      });
  }

  public openOAuth(url){
    window.open(url, 'oAuthWindow');
  }

  public openDropboxOAuth(){
    this.openOAuth("/api/stork/oauth?type=dropbox");
  }

  public openGoogleDriveOAuth(){
    this.openOAuth("/api/stork/oauth?type=googledrive");
  }

  public openGridFtpOAuth(){
    this.openOAuth("/api/stork/oauth?type=gridftp");
  }

  public registerUser(emailId) {
    return this.axios.post(url+'user', {
        action: "register",
        email : emailId
      })
      .then((response) => {
        if(!(response.status === 200))
          throw new Error("Failed to register user")
        else {
            return response
        }
      })
      .catch((error) => {
        //this.statusHandle(error, fail);
        console.error("Error while registering user");
        return {status : 500}
      });
  }


  public verifyRegistraionCode(emailId, code) {
    return this.axios.post(url+'user', {
        action: "verifyCode",
        email : emailId,
        code : code
      })
      .then((response) => {
        return response;
        //this.statusHandle(response, callback);
      })
      .catch((error) => {
        //this.statusHandle(error, fail);
        console.error("Error while verifying the registration code")
        return {status : 500}
      });
  }

  public setPassword(emailId, code, password, confirmPassword) {
    return this.axios.post(url+'user', {
        action: "setPassword",
        email : emailId,
        code : code,
        password : password,
        confirmPassword : confirmPassword
    })
    .then((response) => {
      if(!(response.status === 200))
        throw new Error("Failed to set password for users account")
      else {
        return response;
      }
      //this.statusHandle(response, callback);
    })
    .catch((error) => {
      //this.statusHandle(error, fail);
      return {status : 500}
    });
  }

}    //APICallsService