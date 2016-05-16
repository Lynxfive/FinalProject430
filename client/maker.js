"use strict";

$(document).ready(function() {

    function handleError(message) {
        $("#errorMessage").text(message);
        $("#lobbyMessage").animate({width:'toggle'},100);
    }
    
    function sendAjax(action, data) {
        $.ajax({
            cache: false,
            type: "POST",
            url: action,
            data: data,
            dataType: "json",
            success: function(result, status, xhr) {
                $("#lobbyMessage").animate({width:'hide'},100);

                window.location = result.redirect;
            },
            error: function(xhr, status, error) {
                var messageObj = JSON.parse(xhr.responseText);
            
                handleError(messageObj.error);
            }
        });        
    }
    
    
	$("#makeLobbySubmit").on("click", function(e) {
        e.preventDefault();
    
        $("#lobbyMessage").animate({width:'hide'},100);
    
        if($("#lobbyName").val() == '' || $("#lobbyScore").val() == '') {
            handleError("All fields are required");
            return false;
        }

        sendAjax($("#lobbyForm").attr("action"), $("#lobbyForm").serialize());
        
        return false;
    });
	
});