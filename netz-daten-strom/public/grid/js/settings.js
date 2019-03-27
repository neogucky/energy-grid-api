/*
    This script contains functionalities for the settings page
*/

function onLoad() {
    $("#grid-container").load("grid.html");
}




//TO-DO: In here we load the default color 

//one var for the currentColor as an Array an one as a unicode-string
var pixelColorArray = [];
var pixelColor = "";
//TO-DO: In here we load the default color 
var defaultrgb = [];
defaultrgb[0] = 125;
defaultrgb[1] = 125;
defaultrgb[2] = 125;

var defaultHsl = "hsl("+0+", "+100+"%"+", "+50+"%"+")"; 
var pixelColorHsv = ""; 
var pixelColorHsvArray = []; 
//with this var we controll the mouse over effect
var clicked = false;

var mousedown = false;
/*
loads the color picker png into the canvas and implements the click function on it. Everthing else is in the .ready() so that we make 
sure the document is completly loaded before other methods work
*/
$(document).ready(function () {
    var canvas = $("#myCanvas").get(0);
    var context = canvas.getContext("2d");
    var image = new Image();

    // The colorPicker image now comes from the resources from res/img/colorpicker.js
    // The image is base64 encoded in order to prevent security issues
    image.src = colorPickerImageString;
    image.crossOrigin = "Anonymous";


    //loads the image on the canvas
    $(image).on('load', function () {
        context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
    });
    //Everything that happends according to a click is implemented here
    $(canvas).click(function (e) {

        clearCircle();

        var posX = $(this).offset().left,
            posY = $(this).offset().top;

        var actualX = e.pageX - posX;
        var actualY = e.pageY - posY;

        //Here we get the rgb information out of the clicked Pixel
        var pixelData = context.getImageData(actualX, actualY, 1, 1);
        var data = pixelData.data;
        pixelColorArray = data;
        data[3] = 1;
        pixelColor = "rgba(" + data[0] + ", " + data[1] + ", " + data[2] + ", " + data[3] + ")";
       
		var rgbArray = [];
		rgbArray[0] = data[0];   
		rgbArray[1] = data[1];  
		rgbArray[2] = data[2];     
        var h = rgb2hsl(rgbArray)[0]; 
        var s = rgb2hsl(rgbArray)[1]; 
        var l = rgb2hsl(rgbArray)[2]; 
        
    	pixelColorHsl = "hsl("+h+", "+s+"%"+", "+l+"%"+")"; 
       
        updateColor();

        updateRgbValues(data[0], data[1], data[2], l,s);
        updateRgbRange(data[0], data[1], data[2], l,s);
        updateRgbValueHex(data[0],data[1],data[2]); 

        drawCircle(context, actualX, actualY);
       
    });


    /*
    This Method is triggerd when the Mouse is pressed and sets the Value for MouseDown
    */
    function mouseDown(){
        $(canvas).mousedown(function(){ 
            mouseDown = true; 
        });
    }

    /*
    This Method is triggered when the Mouse Button in released and sets the Value of MouseDown
    */
    function mouseUp(){
        $(canvas).mouseup(function(){
            mouseDown = false; 
        });
    }
    /*
	handles the drawing of the circle and the color selection when the mouse is over the canvas
    */
    function mouseOver() {
        $(canvas).mousemove(function (e) {

            if (clicked == false && mouseDown == true) {
                clearCircle();

                var posX = $(this).offset().left,
                    posY = $(this).offset().top;

                var actualX = e.pageX - posX;
                var actualY = e.pageY - posY;

                //Here we get the rgb information out of the clicked Pixel
                var pixelData = context.getImageData(actualX, actualY, 1, 1);
                var data = pixelData.data;
                pixelColorArray = data;
                data[3] = 1;
                pixelColor = "rgba(" + data[0] + ", " + data[1] + ", " + data[2] + ", " + data[3] + ")";

                var rgbArray = [];
				rgbArray[0] = data[0];   
				rgbArray[1] = data[1];  
				rgbArray[2] = data[2];     
		        var h = rgb2hsl(rgbArray)[0]; 
		        var s = rgb2hsl(rgbArray)[1]; 
		        var l = rgb2hsl(rgbArray)[2]; 
		        
		    	pixelColorHsl = "hsl("+h+", "+s+"%"+", "+l+"%"+")"; 


                updateColor();

                updateRgbValues(data[0], data[1], data[2], l,s);
                updateRgbRange(data[0], data[1], data[2], l,s);
                updateRgbValueHex(data[0],data[1],data[2]); 

                drawCircle(context, actualX, actualY);
            }
        });
    }

    /**
    Important: Call ButtonHandlers before call InputHandlers, otherwise InputHandlers Overwrite Buttonhandlers
    **/
    showHideSaveDialoge();
    abortSaveDialog();
    resetCurrentElement();
    showLoadDialoge();
    abortLoadDialoge();
    saveDialog();
    
    showRangeInfo(); 

    mouseOver();
    mouseDown();  
    mouseUp(); 

    //the Event-Handler-Fkt for the rgb Ranges and input-fields, Call them AFTER the Button Handlers
    inputRangeChanges();
    inputFieldChanges();
    hexInputChanges(); 

    /*
    this function tranfers rgb values to one hex value
    */
    function rgb2hex(red, green, blue) {
        var rgb = blue | (green << 8) | (red << 16);
        return '#' + (0x1000000 + rgb).toString(16).slice(1)
    }

    /*
    this function transfers hex color Information into rgb color Information
    */
    function hex2rgb(hex) {
        var hexReturn = [];
        var hex1 = hex.substring(1); 
        var bigint = parseInt(hex1, 16);
        var r = (bigint >> 16) & 255;
        var g = (bigint >> 8) & 255;
        var b = bigint & 255;

        hexReturn[0] = r;
        hexReturn[1] = g;
        hexReturn[2] = b;

        return hexReturn;
    }

    /*
    This function manages the hover effects over the Labels left from the color-Ranges
    */

    
    function showRangeInfo(){
    	$('#rbgLabelR').hover(function(){
    		document.getElementById("rbgLabelR")
    	}, function(){
    		document.getElementById("rbgLabelR")
    	});

    	$('#rbgLabelG').hover(function(){
    		document.getElementById("rbgLabelG")
    	}, function(){
    		document.getElementById("rbgLabelG")
    	});

    	$('#rbgLabelB').hover(function(){
    		document.getElementById("rbgLabelB")
    	}, function(){
    		document.getElementById("rbgLabelB")
    	});

    	$('#rbgLabelH').hover(function(){
    		document.getElementById("rbgLabelH")
    	}, function(){
    		document.getElementById("rbgLabelH")
    	});

    	$('#rbgLabelS').hover(function(){
    		document.getElementById("rbgLabelS")
    	}, function(){
    		document.getElementById("rbgLabelS")
    	});
    }
    

   /*
	Here we convert the given Array of {red,green,blue} in the hsl color room
   */
    function rgb2hsl(rgbArr){
	    var r1 = rgbArr[0] / 255;
	    var g1 = rgbArr[1] / 255;
	    var b1 = rgbArr[2] / 255;
	 
	    var maxColor = Math.max(r1,g1,b1);
	    var minColor = Math.min(r1,g1,b1);
	    //Calculate L:
	    var L = (maxColor + minColor) / 2 ;
	    var S = 0;
	    var H = 0;
	    if(maxColor != minColor){
	        //Calculate S:
	        if(L < 0.5){
	            S = (maxColor - minColor) / (maxColor + minColor);
	        }else{
	            S = (maxColor - minColor) / (2.0 - maxColor - minColor);
	        }
	        //Calculate H:
	        if(r1 == maxColor){
	            H = (g1-b1) / (maxColor - minColor);
	        }else if(g1 == maxColor){
	            H = 2.0 + (b1 - r1) / (maxColor - minColor);
	        }else{
	            H = 4.0 + (r1 - g1) / (maxColor - minColor);
	        }
	    }
	 
	    L = L * 100;
	    S = S * 100;
	    H = H * 60;
	    if(H<0){
	        H += 360;
	    }
	    
	    var result = [H, S, L];
	    return result;
	}

	/*
	Method that updates the Values displayed in the rgb Input-fields
	*/
    function updateRgbValues(red, green, blue, l, s) {
        document.getElementById("rgb-Red-value").value = red;
        document.getElementById("rgb-Green-value").value = green;
        document.getElementById("rgb-Blue-value").value = blue;
        document.getElementById("rgb-Alpha-value").value = Math.round(l)/100;
        document.getElementById("rgb-Saturation-value").value = Math.round(s)/100; 
    }

    /*
     Method that updates the Values displayed in the rgb Input-Ranges
    */
    function updateRgbRange(red, green, blue, l,s) {
        document.getElementById("rgb-Red").value = red;
        document.getElementById("rgb-Green").value = green;
        document.getElementById("rgb-Blue").value = blue;
        document.getElementById("rgb-Alpha").value = Math.round(l)/100;
        document.getElementById("rgb-Saturation").value = Math.round(s)/100; 

    }

    function updateRgbValueHex(red, green, blue){
        
        document.getElementById("rgb-Hex-value").value = rgb2hex(red,green,blue); 
    }


    /*
     Draws a circle on the given x and y coordinates and the given context
    */
    function drawCircle(context, actualX, actualY) {
        if (pixelColorArray[0] > 1 && pixelColorArray[1] > 1 && pixelColorArray[2] > 1) {
            context.beginPath();
            context.arc(actualX, actualY, 5, 0, 2 * Math.PI);
            context.stroke();
        }

    }

    /*
     This Method updates the color of the two color-displays,it also 
     checks if the user clicked somewhere on the canvas where no color is 
    */
    function updateColor() {
        if (pixelColorArray[0] > 1 && pixelColorArray[1] > 1 && pixelColorArray[2] > 1) {
            $("#colorDisplay").css({"backgroundColor": pixelColorHsl});
            $("#currentColor").css({"backgroundColor": pixelColorHsl});
         
        }
    }

    /*
     Method to get the drawn circle away by just clearing the canvas and redrawing the
     image on it 
    */
    function clearCircle() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
    }

    /*
     This Method adds Event-Handlers to the rgb-Ranges and checks for changes on them 
     if they are changed this method handles the consequences
    */
    function inputRangeChanges() {

        var input = [];

        input[0] = document.getElementById("rgb-Red");
        input[1] = document.getElementById("rgb-Green");
        input[2] = document.getElementById("rgb-Blue");
        input[3] = document.getElementById("rgb-Alpha");
        input[4] = document.getElementById("rgb-Saturation"); 

        for (var i = 0; i < input.length; i++) {
            input[i].addEventListener("input", function () {
                var red = document.getElementById("rgb-Red").value,
                    green = document.getElementById("rgb-Green").value,
                    blue = document.getElementById("rgb-Blue").value,
                    alpha = document.getElementById("rgb-Alpha").value;
                    saturation = document.getElementById("rgb-Saturation").value;

                rgbArray = [];
                rgbArray[0] = red; 
                rgbArray[1] = green; 
                rgbArray[2] = blue; 
		        var h = rgb2hsl(rgbArray)[0]; 
		        var s = saturation*100;
		        var l = alpha*100; 
		         
		    	pixelColorHsl = "hsl("+h+", "+s+"%"+", "+l+"%"+")";
		    	
                pixelColorArray[0] = red;
                pixelColorArray[1] = green;
                pixelColorArray[2] = blue;

                pixelColor = "rgba(" + red + ", " + green + ", " + blue + ", " + alpha + ")";

                updateColor();
                updateRgbValues(red, green, blue, l,s);
                updateRgbValueHex(red,green,blue); 

                clearCircle();

            });
        }
    }

    /*
    this function handles the input to the hex field 
    */
    function hexInputChanges(){
        document.getElementById("rgb-Hex-value").addEventListener("input",function(){
            var hex = document.getElementById("rgb-Hex-value").value;
            
            var red = hex2rgb(hex)[0];
            var green = hex2rgb(hex)[1];
            var blue = hex2rgb(hex)[2];

            var rgbArr = []; 
            rgbArr[0] = red; 
            rgbArr[1] = green;
            rgbArr[2] = blue;

            var h = rgb2hsl(rgbArr)[0];
            var s = rgb2hsl(rgbArr)[1];
            var l = rgb2hsl(rgbArr)[2];


            pixelColorHsl = "hsl("+h+", "+s+"%"+", "+l+"%"+")";
            pixelColor = "rgba(" + red + ", " + green + ", " + blue + ", " + 1 + ")";
            pixelColorArray[0] = red;
            pixelColorArray[1] = green;
            pixelColorArray[2] = blue; 

            updateColor();
            updateRgbValues(red, green, blue, l,s);
            updateRgbRange(red, green, blue, l,s);

            
            clearCircle();

        })
    }

    /*
	This Method adds Event-Handlers to the rgb-Ranges and checks for changes on them 
	if they are changed this method handles the consequences
    */
    function inputFieldChanges() {

        var input = [];

        input[0] = document.getElementById("rgb-Red-value");
        input[1] = document.getElementById("rgb-Green-value");
        input[2] = document.getElementById("rgb-Blue-value");
        input[3] = document.getElementById("rgb-Alpha-value");
        input[4] = document.getElementById("rgb-Saturation-value"); 
        //try catch block to avoid syntax error when listener is not defined
        try{
            for (var i = 0; input.length; i++) {
                input[i].addEventListener("input", function () {
                    red = document.getElementById("rgb-Red-value").value,
                    green = document.getElementById("rgb-Green-value").value,
                    blue = document.getElementById("rgb-Blue-value").value,
                    alpha = document.getElementById("rgb-Alpha-value").value;
                    saturation = document.getElementById("rgb-Saturation-value").value; 

                    //alpha = rgb2hsv(red,green,blue).s;
                    pixelColor = "rgba(" + red + ", " + green + ", " + blue + ", " + alpha + ")";

                    rgbArray = [];
	                rgbArray[0] = red; 
	                rgbArray[1] = green; 
	                rgbArray[2] = blue; 
			        var h = rgb2hsl(rgbArray)[0]; 
			        var s = saturation*100; 
			        var l = alpha*100; 
			        
			    	pixelColorHsl = "hsl("+h+", "+s+"%"+", "+l+"%"+")"; 

                    updateColor();
                    updateRgbRange(red, green, blue, l,s);
                    updateRgbValueHex(red,green,blue); 

                    clearCircle();
                });
            }
        }catch(err){
            
        }
        
    }

    /*
     Method to reset the Color of the Current element to a default color
    */
    function resetCurrentElement() {
        $('#resetCurrentElement').click(function (event) {
            var tmphsl = [];
                tmphsl [0] = rgb2hsl(defaultrgb)[0]; 
                tmphsl [1] = rgb2hsl(defaultrgb)[1];
                tmphsl [2] = rgb2hsl(defaultrgb)[2];

            var red = defaultrgb[0];
            var green = defaultrgb[1];
            var blue = defaultrgb[2];
            var s = tmphsl[1];
            var l = tmphsl[2]; 
            pixelColorHsl = "hsl("+tmphsl[0]+", "+tmphsl[1]+"%"+", "+tmphsl[2]+"%"+")"; 

            updateColor();
            clearCircle(); 
            updateRgbRange(red, green, blue, l,s);
            updateRgbValues(red, green, blue, l,s);
            updateRgbValueHex(red,green,blue);


           
        });
    }

    /*
	click function to display or hide the save dialog by clicking on the save Button under the Color Selection 
    */
    function showHideSaveDialoge() {
        $('#saveScheme').click(function (event) {
            if ($('#saveDialog').css('display') == 'none') {
                $('#saveDialog').css('display', 'block');
                $('#diasableBackground').css('display', 'block');
            } else if ($('#saveDialog').css('display') == 'block') {
                $('#saveDialog').css('display', 'none');
                $('#diasableBackground').css('display', 'none');
                //clear textfield
                $('#schemeName').val('');
            }
        });
    }

    /*
	click function for the abort Button on the save dialog to abort the save dialog
    */
    function abortSaveDialog() {
        $('#dialogAbortSaveBtn').click(function (event) {
            $('#saveDialog').css('display', 'none');
            $('#diasableBackground').css('display', 'none');
            //clear textfield
            $('#schemeName').val('');
        });
    }

    /*
	click function to display or hide the load dialog by clicking on the load Button under the Color Selection 
    */
    function showLoadDialoge() {
        $('#loadScheme').click(function (event) {
            if ($('#loadDialog').css('display') == 'none') {
                $('#loadDialog').css('display', 'block');
                $('#diasableBackground').css('display', 'block');
            } else if ($('#loadDialog').css('display') == 'block') {
                $('#loadDialog').css('display', 'none');
                $('#diasableBackground').css('display', 'none');
            }
        });
    }

    /*
	click function for the abort Button on the load dialog to abort the load dialog
    */
    function abortLoadDialoge() {
        $('#dialogAbortLoadBtn').click(function (event) {
            $('#loadDialog').css('display', 'none');
            $('#diasableBackground').css('display', 'none');
        });
    }

    function saveDialog() {
        $('#dialogSaveSchemeBtn').click(function () {
            console.log()
            if ($('#schemeName').val() == '') {
                alert("Herzlichen Glückwunsch, du hast einen Button ohne Funktionalität gedrückt")
            } else if ($('#schemeName').val() != '') {
                alert("Hey " + $('#schemeName').val() + " dieser Button hat noch keine Funktionen");
            }

        });
    }

});


