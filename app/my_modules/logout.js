

function logout(req) {
        	 req.session.twitUser = {"id": "" ,   //clear the details
             "token": "",
            "username": "",   
             "displayName": ""
    }
}

module.exports = {logout : logout};