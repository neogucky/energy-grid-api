/*
    This script contains functionalities for the settings page
*/
//in this variable we alsways safe the id of the current clicked node
var nodeId; 


/*
This function gets called by the grid everytime the user clicks a node which is isn't the current node
*/
function onSelectedSubstationChanged(id){
    //safe the clicked node
    nodeId = id; 
    //get the current colors, parse them and safe the color of the clicked node
    var backgroundColors = localStorage.getItem("colors");
    var backgroundColorsParsed = JSON.parse(backgroundColors);
    var backgroundColor = backgroundColorsParsed[nodeId];
    //set the background of the color display from the clicked node
    $('#currentColor').css({"backgroundColor":backgroundColor}); 
    //safe that a node has been clicked
    currentStationClicked = true; 
    //disable the other display windows 
    standardStationClicked = false; 
    standardConnectionCLicked = false;
    disabledConnectionClicked = false; 
    backgroundGridClicked = false; 
    //set the white suroundings for the box of the current node and dísable it for the 
    //other nodes
    $('#selectedElement').css({"-webkit-box-shadow":"inset 0px 0px 0px 2px white",
                                        "-moz-box-shadow":"inset 0px 0px 0px 2px white",
                                        "box-shadow":"inset 0px 0px 0px 2px white"});
    $('#selectedElement').css({"cursor":"pointer"}); 

    $('#standardStation').css({"-webkit-box-shadow":"inset 0px 0px 0px 0px white",
                                        "-moz-box-shadow":"inset 0px 0px 0px 0px white",
                                        "box-shadow":"inset 0px 0px 0px 0px white"});
    $('#standardConnection').css({"-webkit-box-shadow":"inset 0px 0px 0px 0px white",
                                        "-moz-box-shadow":"inset 0px 0px 0px 0px white",
                                        "box-shadow":"inset 0px 0px 0px 0px white"});
    $('#disabledConnection').css({"-webkit-box-shadow":"inset 0px 0px 0px 0px white",
                                        "-moz-box-shadow":"inset 0px 0px 0px 0px white",
                                        "box-shadow":"inset 0px 0px 0px 0px white"});
    $('#backgroundGrid').css({"-webkit-box-shadow":"inset 0px 0px 0px 0px white",
                                        "-moz-box-shadow":"inset 0px 0px 0px 0px white",
                                        "box-shadow":"inset 0px 0px 0px 0px white"});
    //get the api from the grid ...
    var api = window.frames[0].getApi();  
    //...to call function to find the name of the clicked node....
    var stationName = api.findObjectById(api.nodes, nodeId).data.name;
    //...and display it in the field 
    document.getElementById("selectedElementP-tag").innerHTML = stationName; 
    //get the colors out of the localstorage
    var colors = JSON.parse(localStorage.getItem("colors"));
    //safe the current color
    var currentColorHex = colors[nodeId];
    //call this function to update the valus of the Ranges, fields and hex Value
    manageRangeHexValueUpdate(currentColorHex); 
    //check if the node id is a station, and update the currentSelectedStation if it
    //is a station
    if(nodeId!="bg"&&nodeId!="ds"&&nodeId!="dc"&&nodeId!="uc"){
    	currentSelectedStation = nodeId; 
    }
}






//The variable in which the grid colors will be saved
var gridColor = {};
//one var for the currentColor as an Array an one as a unicode-string
var pixelColorArray = [];
var pixelColor = "";
//all the variable in where we safe the color information in differnt formats
var pixelColorHsv = ""; 
var pixelColorHsvArray = []; 
var pixelColorArrayHsl = []; 
//with this var we controll the mouse over effect
var clicked = false;
var mousedown = false;
//Variables to safe the standart Station, connection and blocked connectio color and
//the background color and booleans to safe if one of the boxes was clicked by the user
var currentStationColor;
var currentStationClicked = false; 

var standardStationColor; 
var standardStationClicked = false;  

var standardConnectionColor; 
var standardConnectionCLicked = false; 

var disabledConnectionColor; 
var disabledConnectionClicked = false; 

var backgroundGridColor; 
var backgroundGridClicked = false; 
//Flag for the updating of the grid, secures that no update can start before the current one has terminated
var isUpdating = false; 
//nodeId of the current selected stattion on the grid
var currentSelectedStation; 

/*
loads the color picker png into the canvas and implements the click function on it. Everthing else is in the .ready() so that we make 
sure the document is completly loaded before other methods work
*/
/*  ###########################################################
 *  ##  Initializing 
 *  ###########################################################*/
 /*
document.ready funtion --> in here everthing else happens exept of the funtion defined above
 */
$(document).ready(function () {
	//varibale that holds the canvas
    var canvas = $("#myCanvas").get(0);
    var context = canvas.getContext("2d");
    //variable that holds the png that is displayed on the canvas
    var image = new Image();

    // The colorPicker image now comes from the resources from res/img/colorpicker.js
    // The image is base64 encoded in order to prevent security issues
    image.src = colorPickerImageString;
    image.crossOrigin = "Anonymous";


    //loads the image on the canvas
    $(image).on('load', function () {
        context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
    });

  /*  ###########################################################
 *  ##  Here we call the functions 
 *  ###########################################################*/
    /**
    Important: Call ButtonHandlers before call InputHandlers, otherwise InputHandlers Overwrite Buttonhandlers
    **/
    canvasClick()
    initialColoringOfFields(); 
    showHideSaveDialoge();
    abortSaveDialog();
    resetCurrentElement();
    resetAllElements(); 
    showLoadDialoge();
    abortLoadDialoge();
    saveDialog();
    loadColorSchemes();
    showRangeInfo(); 
    mouseOver();
    mouseDown();  
    mouseUp(); 
    selectCurrentStation(); 
    selectStandartStation(); 
    selectStandartConnection();
    selectDisabledConnection();
    selectBackgroundGrid(); 
    addHoverOnBoxes();
    changeCursorsOnLabels();
    abortOverride(); 
 	overrideScheme();
    //the Event-Handler-Fkt for the rgb Ranges and input-fields, Call them AFTER the Button Handlers
    inputRangeChanges();
    inputFieldChanges();
    hexInputChanges(); 
    hsInputChanges(); 

/*  ###########################################################
 *  ##  Funtions to handle User Input on the canvas
 *  ###########################################################*/
 	
    //Everything that happends according to a click is implemented here
    function canvasClick(){
	    $(canvas).click(function (e) {
	    	//delete the circle on the canvas
	        clearCircle();
	        //safe the offset of the canvas
	        var posX = $(this).offset().left,
	            posY = $(this).offset().top;
	        //calculate the actual mouse position
	        var actualX = e.pageX - posX;
	        var actualY = e.pageY - posY;
	        //Here we get the rgb information out of the clicked Pixel
	        var pixelData = context.getImageData(actualX, actualY, 1, 1);
	        //and safe it 
	        var data = pixelData.data;
	        pixelColorArray = data;
	        data[3] = 1;
	        //safe the colorinformation as a String so that css can read it
	        pixelColor = "rgba(" + data[0] + ", " + data[1] + ", " + data[2] + ", " + data[3] + ")";
	       	//convert the colorinfrmation to hsl 
			var rgbArray = [];
			rgbArray[0] = data[0];   
			rgbArray[1] = data[1];  
			rgbArray[2] = data[2];     
	        var h = rgb2hsl(rgbArray)[0]; 
	        var s = rgb2hsl(rgbArray)[1]; 
	        var l = rgb2hsl(rgbArray)[2]; 
	        //convert to string so that css can read them
	    	pixelColorHsl = "hsl("+h+", "+s+"%"+", "+l+"%"+")"; 
	    	//and safe them as an Array for better working with them later
	    	pixelColorArrayHsl[0] = h;
	        pixelColorArrayHsl[1] = s;
	        pixelColorArrayHsl[2] = l; 
	       	//update the color
	        updateColor();
	        //update the colordisplay values
	        updateRgbValues(data[0], data[1], data[2],h, l,s);
	        updateRgbRange(data[0], data[1], data[2],h, l,s);
	        updateRgbValueHex(data[0],data[1],data[2]); 
	        //redraw the circle which displays the mouse click on the canvas
	        drawCircle(context, actualX, actualY);
	    });
	}
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
        	//check if the cursor is over the canvas and the mouse is not clicked
        	if(clicked == false && mouseDown != true){
        		//change the cursor to a grabbing hand 
        		$(canvas).css({"cursor":"-webkit-grab"});
        	}
        	//check if cursor is over the canvas and the user has clicked the mouse
            if (clicked == false && mouseDown == true) {
                $(canvas).css({"cursor":"-webkit-grabbing"});
                //delete the circle
                clearCircle();
                //safe the offset of the canvas
                var posX = $(this).offset().left,
                    posY = $(this).offset().top;
                //calculate the actual mouse position
                var actualX = e.pageX - posX;
                var actualY = e.pageY - posY;
                //Here we get the rgb information out of the clicked Pixel
                var pixelData = context.getImageData(actualX, actualY, 1, 1);
                //and safe it
                var data = pixelData.data;
                pixelColorArray = data;
                data[3] = 1;
                //safe the colorinformation as a String so that css can read it
                pixelColor = "rgba(" + data[0] + ", " + data[1] + ", " + data[2] + ", " + data[3] + ")";
                //convert the colorinfrmation to hsl 
                var rgbArray = [];
				rgbArray[0] = data[0];   
				rgbArray[1] = data[1];  
				rgbArray[2] = data[2];     
		        var h = rgb2hsl(rgbArray)[0]; 
		        var s = rgb2hsl(rgbArray)[1]; 
		        var l = rgb2hsl(rgbArray)[2]; 
		        //and safe them as an Array for better working with them later
                pixelColorArrayHsl[0] = h;
                pixelColorArrayHsl[1] = s;
                pixelColorArrayHsl[2] = l; 
		        //convert to string so that css can read them
		    	pixelColorHsl = "hsl("+h+", "+s+"%"+", "+l+"%"+")"; 
		    	//update the color
                updateColor();
                //update the colordisplay values
                updateRgbValues(data[0], data[1], data[2],h, l,s);
                updateRgbRange(data[0], data[1], data[2],h, l,s);
                updateRgbValueHex(data[0],data[1],data[2]); 
                //redraw the circle
                drawCircle(context, actualX, actualY);
            }
        });
    }

 /*  ###########################################################
 *  ##  Funtions to handle User Input on the on the Ranges
 *  ###########################################################*/
    /*
     This Method adds Event-Handlers to the rgb-Ranges and checks for changes on them 
     if they are changed this method handles the consequences
    */
    function inputRangeChanges() {
    	//array to safe all elements that get input handlers
        var input = [];
        //safe all elements 
        input[0] = document.getElementById("rgb-Red");
        input[1] = document.getElementById("rgb-Green");
        input[2] = document.getElementById("rgb-Blue");
       	//add inout handlers on them
        for (var i = 0; i < input.length; i++) {
            input[i].addEventListener("input", function () {
                //safe the color information from the current values on the ranges
                var red = document.getElementById("rgb-Red").value,
                    green = document.getElementById("rgb-Green").value,
                    blue = document.getElementById("rgb-Blue").value,
                //safe them in an array 
                rgbArray = [];
                rgbArray[0] = red; 
                rgbArray[1] = green; 
                rgbArray[2] = blue; 
		        //convert them to hsl 
		        var tmp = rgb2hsl(rgbArray); 
		        var h = tmp[0]; 
		        var s = tmp[1]; 
		        var l = tmp[2]; 
		        //safe the hsl values in the depending array
                pixelColorArrayHsl[0] = h;
                pixelColorArrayHsl[1] = s;
                pixelColorArrayHsl[2] = l; 
		        //...and safe them as a string so that css can read them
		    	pixelColorHsl = "hsl("+h+", "+s+"%"+", "+l+"%"+")";
		    	//update the global variable for the rgb values
                pixelColorArray[0] = red;
                pixelColorArray[1] = green;
                pixelColorArray[2] = blue;
                //update the colorpicker
                updateColor();
                //update the rgb Ranges
                updateRgbValues(red, green, blue,h, l,s);
                //convert the rgb to hex information
                var tmp = hexToRgb(hslToHex(h,s,l));
                //update the hex field 
                updateRgbValueHex(tmp[0],tmp[1],tmp[2]); 
              	//clear the circle 
                clearCircle();
            });
        }
    }

   /*
	This function handles the User Input on the H and S Ranges
   */
    function hsInputChanges(){
    	//array for the elements that will get a listener
    	var input = [];
    	//add the elements to the array
    	input[0] = document.getElementById("rgb-Alpha");
        input[1] = document.getElementById("rgb-Saturation"); 
        //add input listener on the elements
        for (var i = 0; i < input.length; i++) {
            input[i].addEventListener("input", function () {
            		//safe the current values of the elemenst
                    alpha = document.getElementById("rgb-Alpha").value;
                    saturation = document.getElementById("rgb-Saturation").value;
                    //since we only have values for saturation and lightnes we just take the
                    //hue from the value safed before
			        var h = pixelColorArrayHsl[0]
			        var s = saturation*100;
			        var l = alpha*100; 
			        //update the global value for the hsl values
	                pixelColorArrayHsl[0] = h;
	                pixelColorArrayHsl[1] = s;
	                pixelColorArrayHsl[2] = l; 
			        //convet to a string so that css can read it
			    	pixelColorHsl = "hsl("+h+", "+s+"%"+", "+l+"%"+")";
			    	//convert the hsl to rgb information
			    	var tmpRgb = hexToRgb(hslToHex(h,saturation*100,alpha*100)); 
			    	//safe the rgb information in the global variable for them
	                pixelColorArray[0] = tmpRgb[0];
	                pixelColorArray[1] = tmpRgb[1];
	                pixelColorArray[2] = tmpRgb[2];
	                //initalise red green and blue variables
	                var red = tmpRgb[0];
	                var green = tmpRgb[1];
	                var blue = tmpRgb[2];
	                //update the pixelcolor string
	                pixelColor = "rgba(" + tmpRgb[0] + ", " + tmpRgb[1] + ", " + tmpRgb[2] + ", " + alpha + ")";
	                //update the color
	                updateColor();
	                //update the Rgb Values 
	                updateRgbValues(red, green, blue,h, l,s);
	                //just update the rgb values to avoid timing problems
	               	updateJustRgbRange(red,green,blue); 
	                //convet to a hex value
	                var tmp = hexToRgb(hslToHex(h,s,l));
	                //update the hex value
	                updateRgbValueHex(tmp[0],tmp[1],tmp[2]); 
	               	//delte the circle 
	                clearCircle();

	        });
	    }
    }

 /*  ###########################################################
 *  ##  Funtions to handle User Input on the on the Hex und Value Fields
 *  ###########################################################*/
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

            pixelColorArrayHsl[0] = h;
            pixelColorArrayHsl[1] = s;
            pixelColorArrayHsl[2] = l; 


            pixelColorHsl = "hsl("+h+", "+s+"%"+", "+l+"%"+")";
            pixelColor = "rgba(" + red + ", " + green + ", " + blue + ", " + 1 + ")";
            pixelColorArray[0] = red;
            pixelColorArray[1] = green;
            pixelColorArray[2] = blue; 

            updateColor();
            updateRgbValues(red, green, blue,h, l,s);
            updateRgbRange(red, green, blue,h, l,s);

            
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

                    pixelColor = "rgba(" + red + ", " + green + ", " + blue + ", " + alpha + ")";

                    rgbArray = [];
	                rgbArray[0] = red; 
	                rgbArray[1] = green; 
	                rgbArray[2] = blue; 
			        var h = rgb2hsl(rgbArray)[0]; 
			        var s = saturation*100; 
			        var l = alpha*100; 

                    pixelColorArrayHsl[0] = h;
                    pixelColorArrayHsl[1] = s;
                    pixelColorArrayHsl[2] = l; 
			        
			    	pixelColorHsl = "hsl("+h+", "+s+"%"+", "+l+"%"+")"; 

                    updateColor();
                    updateRgbRange(red, green, blue,h, l,s);

                    var tmp = hexToRgb(hslToHex(h,s,l));

                	updateRgbValueHex(tmp[0],tmp[1],tmp[2]); 
                    clearCircle();
                });
            }
        }catch(err){
            
        }
        
    }

 /*  ###########################################################
 *  ##  All the Update Functions
 *  ###########################################################*/
 	/*
	the function to update the color Fields when the grid calls onSelectedSubstationChanged
	defined on window because the calling function has a bigger scope
 	*/
 	window.manageRangeHexValueUpdate = function(hex){
		var colorHex = hex; 
		var colorRgb = hexToRgb(hex); 
		var colorHsl = rgb2hsl(colorRgb); 

		updateRgbValueHex(colorRgb[0],colorRgb[1],colorRgb[2]);
		updateRgbRange(colorRgb[0],colorRgb[1],colorRgb[2],colorHsl[0],colorHsl[1],colorHsl[2]); 
		updateRgbValues(colorRgb[0],colorRgb[1],colorRgb[2],colorHsl[0],colorHsl[1],colorHsl[2]); 
	}
	/*
	Method that updates the Values displayed in the rgb Input-fields
	*/
    function updateRgbValues(red, green, blue,h, l, s) {
        document.getElementById("rgb-Red-value").value = red;
        document.getElementById("rgb-Green-value").value = green;
        document.getElementById("rgb-Blue-value").value = blue;
        document.getElementById("rgb-Alpha-value").value = Math.round(l)/100;
        document.getElementById("rgb-Saturation-value").value = Math.round(s)/100; 
    }
    /*
     Method that updates the Values displayed in the rgb Input-Ranges
    */
    function updateRgbRange(red, green, blue,h, l,s) {
    	
        var rgbColor = hexToRgb(hslToHex(h,s,l));
        
        var hslColor = rgb2hsl(rgbColor); 
       
        document.getElementById("rgb-Red").value = rgbColor[0];
        document.getElementById("rgb-Green").value = rgbColor[1];
        document.getElementById("rgb-Blue").value = rgbColor[2];
        
        document.getElementById("rgb-Alpha").value = Math.round(hslColor[2])/100;
        document.getElementById("rgb-Saturation").value = Math.round(hslColor[1])/100;
    }
    /*
	Function to update just the Rgb Ranges
    */
    function updateJustRgbRange(red, green, blue){
    	document.getElementById("rgb-Red").value = red;
        document.getElementById("rgb-Green").value = green;
        document.getElementById("rgb-Blue").value = blue;
    }
    /*
	This function updates the Hex Value Display
    */
    function updateRgbValueHex(red, green, blue){
        document.getElementById("rgb-Hex-value").value = rgb2hex(red,green,blue); 
    }
    /*
     This Method updates the color of the two color-displays,it also 
     checks if the user clicked somewhere on the canvas where no color is 
    */
    function updateColor() {
        if (pixelColorArray[0] > 1 && pixelColorArray[1] > 1 && pixelColorArray[2] > 1) {
        	
            var color = hslToHex(pixelColorArrayHsl[0],pixelColorArrayHsl[1],pixelColorArrayHsl[2]);  
           

        	if(currentStationClicked == true){
        		$("#currentColor").css({"backgroundColor": pixelColorHsl});
        		currentStationColor = pixelColorHsl;
        		
        	}else if(standardStationClicked == true){
         		$("#standardStationColor").css({"backgroundColor": pixelColorHsl});
         		standardStationColor = pixelColorHsl; 
                nodeId = "ds";
         	}else if(standardConnectionCLicked == true){
         		$("#standardConnectionColor").css({"backgroundColor": pixelColorHsl});
         		standardConnectionColor = pixelColorHsl; 
                nodeId = "uc";
         	}else if(disabledConnectionClicked == true){
         		$("#disabledConnectionColor").css({"backgroundColor": pixelColorHsl});
         		disabledConnectionColor = pixelColorHsl; 
                nodeId = "dc";
         	}else if(backgroundGridClicked == true){
         		$("#backgroundGridnColor").css({"backgroundColor": pixelColorHsl});
         		nodeId = "bg"; 
         	}
         	
            updateGridColor(color); 
            
        }
    }

    /*
    This function updates the colors on the grid
    */
    function updateGridColor(currentColor){
        var colors = localStorage.getItem("colors"); 
        colorsParsed = JSON.parse(colors); 
        
        colorsParsed[nodeId] = currentColor;

        colors = JSON.stringify(colorsParsed); 

        localStorage.setItem("colors",colors);  
        
        if(isUpdating == false){
            isUpdating = true;
            window.frames[0].recolorGrid(); 
            isUpdating = false;
        }
    }
    /*
	This function manages the coloring of the color Displays initally
    */
    function initialColoringOfFields(){
        var backgroundColors = localStorage.getItem("colors");
        var backgroundColorsParsed = JSON.parse(backgroundColors);
        $('#standardStationColor').css({"backgroundColor":backgroundColorsParsed["ds"]}); 
        $('#standardConnectionColor').css({"backgroundColor":backgroundColorsParsed["uc"]}); 
        $('#disabledConnectionColor').css({"backgroundColor":backgroundColorsParsed["dc"]});
        $('#backgroundGridnColor').css({"backgroundColor":backgroundColorsParsed["bg"]});  
    }

 /*  ###########################################################
 *  ##  Functions to convert colorValues
 *  ###########################################################*/
 	 /*
    this function tranfers rgb values to one hex value
    */
    function rgb2hex(red, green, blue) {
        var rgb = blue | (green << 8) | (red << 16);
        return '#' + (0x1000000 + rgb).toString(16).slice(1)
    }
    /*
	function to convert hex to Rgb
	expects hex Value as string with a starting #
    */
    function hexToRgb(hex){
        try{
        	var hex = hex.replace('#','');
	        r = parseInt(hex.substring(0,2), 16);
	        g = parseInt(hex.substring(2,4), 16);
	        b = parseInt(hex.substring(4,6), 16);

	        result = [];
	        result[0] = r;
	        result[1] = g;
	        result[2] = b;
	        
	        return result;
        }catch(err){
        	console.log("Hex Wert nicht richtig definiert "+err);
        }
        
    }
    /*
    this function converts hsl values in hex values
    */
    function hslToHex(h, s, l) {
      h /= 360;
      s /= 100;
      l /= 100;
      let r, g, b;
      if (s === 0) {
        r = g = b = l; // achromatic
      } else {
        const hue2rgb = (p, q, t) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
      }
      const toHex = x => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
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


 /*  ###########################################################
 *  ##  fucntions for Hover effects
 *  ###########################################################*/
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
	this function manages the hover effects on the boxes 
    */
    function addHoverOnBoxes(){
    	$('#selectedElement').hover(function(){
    		$(this).css({"-webkit-box-shadow":"inset 0px 0px 0px 2px white",
    									"-moz-box-shadow":"inset 0px 0px 0px 2px white",
    									"box-shadow":"inset 0px 0px 0px 2px white"});
    		$(this).css({"cursor":"pointer"}); 
    	}, function(){
    		if(currentStationClicked == true){
    			$(this).css({"-webkit-box-shadow":"inset 0px 0px 0px 2px white",
    									"-moz-box-shadow":"inset 0px 0px 0px 2px white",
    									"box-shadow":"inset 0px 0px 0px 2px white"});
    		}else if(currentStationClicked == false){
    			$(this).css({"-webkit-box-shadow":"inset 0px 0px 0px 0px white",
    									"-moz-box-shadow":"inset 0px 0px 0px 0px white",
    									"box-shadow":"inset 0px 0px 0px 0px white"});
    		}
    		
    	}); 

    	$('#standardStation').hover(function(){
    		$(this).css({"-webkit-box-shadow":"inset 0px 0px 0px 2px white",
    									"-moz-box-shadow":"inset 0px 0px 0px 2px white",
    									"box-shadow":"inset 0px 0px 0px 2px white"});
    		$(this).css({"cursor":"pointer"}); 
    	}, function(){
    		if(standardStationClicked == true){
    			$(this).css({"-webkit-box-shadow":"inset 0px 0px 0px 2px white",
    									"-moz-box-shadow":"inset 0px 0px 0px 2px white",
    									"box-shadow":"inset 0px 0px 0px 2px white"});
    		}else if(standardStationClicked == false){
    			$(this).css({"-webkit-box-shadow":"inset 0px 0px 0px 0px white",
    									"-moz-box-shadow":"inset 0px 0px 0px 0px white",
    									"box-shadow":"inset 0px 0px 0px 0px white"});
    		}
    		
    	});

    	$('#standardConnection').hover(function(){
    		$(this).css({"-webkit-box-shadow":"inset 0px 0px 0px 2px white",
    									"-moz-box-shadow":"inset 0px 0px 0px 2px white",
    									"box-shadow":"inset 0px 0px 0px 2px white"});
    		$(this).css({"cursor":"pointer"}); 
    	}, function(){
    		if(standardConnectionCLicked == true){
    			$(this).css({"-webkit-box-shadow":"inset 0px 0px 0px 2px white",
    									"-moz-box-shadow":"inset 0px 0px 0px 2px white",
    									"box-shadow":"inset 0px 0px 0px 2px white"});
    		}else if(standardConnectionCLicked == false){
    			$(this).css({"-webkit-box-shadow":"inset 0px 0px 0px 0px white",
    									"-moz-box-shadow":"inset 0px 0px 0px 0px white",
    									"box-shadow":"inset 0px 0px 0px 0px white"});
    		}
    	});

    	$('#disabledConnection').hover(function(){
    		$(this).css({"-webkit-box-shadow":"inset 0px 0px 0px 2px white",
    									"-moz-box-shadow":"inset 0px 0px 0px 2px white",
    									"box-shadow":"inset 0px 0px 0px 2px white"});
    		$(this).css({"cursor":"pointer"}); 
    	}, function(){
    		if(disabledConnectionClicked == true){
    			$(this).css({"-webkit-box-shadow":"inset 0px 0px 0px 2px white",
    									"-moz-box-shadow":"inset 0px 0px 0px 2px white",
    									"box-shadow":"inset 0px 0px 0px 2px white"});
    		}else if(disabledConnectionClicked == false){
    			$(this).css({"-webkit-box-shadow":"inset 0px 0px 0px 0px white",
    									"-moz-box-shadow":"inset 0px 0px 0px 0px white",
    									"box-shadow":"inset 0px 0px 0px 0px white"});
    		}
    	});

    	$('#backgroundGrid').hover(function(){
    		$(this).css({"-webkit-box-shadow":"inset 0px 0px 0px 2px white",
    									"-moz-box-shadow":"inset 0px 0px 0px 2px white",
    									"box-shadow":"inset 0px 0px 0px 2px white"});
    		$(this).css({"cursor":"pointer"}); 
    	}, function(){
    		if(backgroundGridClicked == true){
    			$(this).css({"-webkit-box-shadow":"inset 0px 0px 0px 2px white",
    									"-moz-box-shadow":"inset 0px 0px 0px 2px white",
    									"box-shadow":"inset 0px 0px 0px 2px white"});
    		}else if(backgroundGridClicked == false){
    			$(this).css({"-webkit-box-shadow":"inset 0px 0px 0px 0px white",
    									"-moz-box-shadow":"inset 0px 0px 0px 0px white",
    									"box-shadow":"inset 0px 0px 0px 0px white"});
    		}
    	});
    }
    
 /*  ###########################################################
 *  ##  Functions to handle Reset functionalities
 *  ###########################################################*/
 	/*
     Method to reset the Color of the Current element to a default color
    */
    function resetCurrentElement() {
        $('#resetCurrentElement').click(function (event) { 
           
			var defaultColors = getDefaultColors(); 
            colors = localStorage.getItem("colors"); 
            colorsParsed = JSON.parse(colors); 
            var defaultColorsParsed = JSON.parse(JSON.stringify(defaultColors)); 

        	if(backgroundGridClicked == true){
        		
        		colorsParsed["bg"] = defaultColorsParsed["bg"];  

                localStorage.setItem("colors",JSON.stringify(colorsParsed)); 

                window.frames[0].recolorGrid();

                var tmp = JSON.parse(localStorage.getItem("colors"));
                
                hex = tmp["bg"];

                var rgb = hexToRgb(hex); 

                var red = rgb[0];
                var green = rgb[1];
                var blue = rgb[2];

                var hsl = rgb2hsl(rgb); 
                var h = hsl[0]; 
                var s = hsl[1]; 
                var l = hsl[2]; 
                var hslString = "hsl("+h+", "+s+"%"+", "+l+"%"+")";

                $('#backgroundGridnColor').css({"backgroundColor":hslString});

        	}else if(disabledConnectionClicked == true){
        		
        		colorsParsed["dc"] = defaultColorsParsed["dc"];  

                localStorage.setItem("colors",JSON.stringify(colorsParsed)); 

                window.frames[0].recolorGrid();

                var tmp = JSON.parse(localStorage.getItem("colors"));
                hex = tmp["dc"];

                var rgb = hexToRgb(hex); 

                var red = rgb[0];
                var green = rgb[1];
                var blue = rgb[2];

                var hsl = rgb2hsl(rgb); 
                var h = hsl[0]; 
                var s = hsl[1]; 
                var l = hsl[2]; 
                var hslString = "hsl("+h+", "+s+"%"+", "+l+"%"+")";

                $('#disabledConnectionColor').css({"backgroundColor":hslString});


        	}else if(standardStationClicked == true){
        		 
        		colorsParsed["ds"] = defaultColorsParsed["ds"];  

                localStorage.setItem("colors",JSON.stringify(colorsParsed)); 

                window.frames[0].recolorGrid();

                var tmp = JSON.parse(localStorage.getItem("colors"));
                hex = tmp["ds"];

                var rgb = hexToRgb(hex); 

                var red = rgb[0];
                var green = rgb[1];
                var blue = rgb[2];

                var hsl = rgb2hsl(rgb); 
                var h = hsl[0]; 
                var s = hsl[1]; 
                var l = hsl[2]; 
                var hslString = "hsl("+h+", "+s+"%"+", "+l+"%"+")";

                $('#standardStationColor').css({"backgroundColor":hslString});

        	}else if(currentStationClicked == true){
        		
        		colorsParsed[nodeId] = defaultColorsParsed[nodeId];  

                localStorage.setItem("colors",JSON.stringify(colorsParsed)); 

                window.frames[0].recolorGrid();

                var tmp = JSON.parse(localStorage.getItem("colors"));
                hex = tmp[nodeId];

                var rgb = hexToRgb(hex); 

                var red = rgb[0];
                var green = rgb[1];
                var blue = rgb[2];

                var hsl = rgb2hsl(rgb); 
                var h = hsl[0]; 
                var s = hsl[1]; 
                var l = hsl[2]; 
                var hslString = "hsl("+h+", "+s+"%"+", "+l+"%"+")";

                $('#currentColor').css({"backgroundColor":hslString});
        	}
                clearCircle(); 
                
                updateRgbRange(red, green, blue,h, l,s);
                updateRgbValues(red, green, blue,h, l,s);
                updateRgbValueHex(red,green,blue);
        });
    }
    /*
	Funtion to Reset all Elements to the default Colors
    */
    function resetAllElements(){
        $('#resetAllElements').click(function(){
            var defaultColors = getDefaultColors();            
            colors = localStorage.getItem("colors"); 
            colorsParsed = JSON.parse(colors); 
            var defaultColorsParsed = JSON.parse(JSON.stringify(defaultColors)); 

           
            localStorage.setItem("colors",JSON.stringify(defaultColors)); 
           
            window.frames[0].recolorGrid();

            var tmp = JSON.parse(localStorage.getItem("colors"));
            
            hex = tmp["bg"];

            $('#currentColor').css({"backgroundColor":tmp[currentSelectedStation]}); 
            $('#backgroundGridnColor').css({"backgroundColor":tmp["bg"]}); 
            $('#disabledConnectionColor').css({"backgroundColor":tmp["dc"]}); 
            $('#standardConnectionColor').css({"backgroundColor":tmp["uc"]}); 
            $('#standardStationColor').css({"backgroundColor":tmp["ds"]}); 

            clearCircle(); 
        });
    }
    /*
	Function which gererates an Object with the defautl colors
    */
    function getDefaultColors(){
        var defaultColors = ["#03A9F4", "#F44336", "#4CAF50", "#FFEB3B", "#FF5722", "#673AB7", "#E91E63", "#3F51B5", "#8BC34A", "#00BCD4", "#FFC107", "#795548", "#9C27B0", "#2196F3", "#CDDC39", "#009688", "#FF9800", "#607D8B"];
        var api = window.frames[0].getApi(); 
        var colors = new Object();
            var i = 0;
            // Search for substations
            api.nodes.forEach(function (node) {
                if (node.type == "substation") {
                    if (i < defaultColors.length) {
                        // Set a deafuelt color, if there is a free one
                        colors[node.id] = defaultColors[i];
                        i++;
                    } else {
                        // Else add a random color
                        colors[node.id] = getRandomColor();
                    }
                }
            });
            // Default color for the Background
            colors["bg"] = "#333333";
            // Default color for the Disabled connection
            colors["dc"] = "#777777";
            // Default color for the Unplugged connection
            colors["uc"] = "#aaaaaa";
            // Default color for the Unplugged Station
            colors["ds"] = "#aaaaaa";

            return colors;
    }
    /*
	Function to generate random colors, is used when the default colors are empty
    */
    function getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

 /*  ###########################################################
 *  ##  Functions to handle Load functionalities
 *  ###########################################################*/
    /*
	click function for the abort Button on the load dialog to abort the load dialog
    */
    function abortLoadDialoge() {
        $('#dialogAbortLoadBtn').click(function (event) {
            $('#loadDialog').css('display', 'none');
            $('#diasableBackground').css('display', 'none');
        });
    }
    /*
	This function is activatet when the user clicks on the load button in the depending dialoge.
	It gets the colorschemes from the api and saves them in a variable, then it returns the colorscheme which the 
	user has selected. 
    */
    function loadColorSchemes(){
        $('#dialogLoadSchemeBtn').on('click', function(){
            dpd.gridsettings.get(function(results,error){
                var selectedSchemeName = document.getElementById("schemeNameSelect").options[document.getElementById("schemeNameSelect").value].innerHTML; 
                var selectedScheme; 
                for(var i = 0; i < results.length;i++){
                    if(selectedSchemeName == results[i].settingName){
                        selectedScheme = results[i];  
                        var tmp = JSON.stringify(selectedScheme.value);

                        localStorage.setItem("colors",tmp); 
                    
                        window.frames[0].recolorGrid(); 
                        $('#loadDialog').css('display', 'none');
                        $('#diasableBackground').css('display', 'none');

                        if(currentSelectedStation != undefined){
                       		$('#currentColor').css({"backgroundColor":selectedScheme.value[currentSelectedStation]});
                        }

                        $('#standardStationColor').css({"backgroundColor":selectedScheme.value["ds"]});
                        $('#disabledConnectionColor').css({"backgroundColor":selectedScheme.value["dc"]});
                        $('#backgroundGridnColor').css({"backgroundColor":selectedScheme.value["bg"]});
                    }
                }
            });

        });
    }
    /*
	click function to display or hide the load dialog by clicking on the load Button under
    the Color Selection. And Then load the Data from the Api and display all the different 
    color schemes in the select boxes 
    */
    function showLoadDialoge() {
        $('#loadScheme').click(function (event) {
            
            if ($('#loadDialog').css('display') == 'none') {
                var colorTmp; 
                dpd.gridsettings.get(function(results,error){
                    namesTmp = results; 

                    var selectElement = document.getElementById('schemeNameSelect');
                    
                    for(var i=0;i<namesTmp.length;i++){
                        var option = new Option(namesTmp[i].settingName, i);
                        selectElement.options[i] = option;
                    }

                });

                $('#loadDialog').css('display', 'block');
                $('#diasableBackground').css('display', 'block');
            } else if ($('#loadDialog').css('display') == 'block') {
                $('#loadDialog').css('display', 'none');
                $('#diasableBackground').css('display', 'none');
            }
        });
    }
    
 /*  ###########################################################
 *  ##  Functions to handle save functionalities
 *  ###########################################################*/
 	/*
	Fucntion that handles when the user uses the override button
 	*/
 	function overrideScheme(){
 		$('#dialogSaveSchemeName').on("click",function(){
 			var currentSchemeName = $('#schemeName').val(); 
 			var currentScheme; 
 			dpd.gridsettings.get(function(results, error){
 				for(i=0;i<results.length;i++){
           			if(results[i].settingName == currentSchemeName){
        				 currentScheme = results[i]; 
		        		}
		        	}

		        	var id = currentScheme.id; 
		        	var colors = JSON.parse(localStorage.getItem("colors"));

		 			dpd.gridsettings.put({id: id,value:colors}, function(result, error) {
		  				
					})

		 			$('#saveDialogNameDouble').css({"display":"none"}); 

			        $('#saveDialog').css('display', 'none');
			        $('#diasableBackground').css('display', 'none');
			        //clear textfield
			        $('#schemeName').val('');
			        
			 	});
 			})
 			
	}
	/*
	function to handle when the user aborts the override dialoge
	*/
	function abortOverride(){
		$('#dialogAbortSaveName').on("click",function(){
			$('#saveDialogNameDouble').css({"display":"none"});
		})
	}



 	/*
    this function manages the saving of the current color scheme
    */
    function saveDialog() {
        $('#dialogSaveSchemeBtn').click(function () {
        	
        	var checkDuplicate = false;
        	var currentSchemeName = $('#schemeName').val();
        			
        	dpd.gridsettings.get(function(results,error){
        	
        		for(i=0;i<results.length;i++){
           			if(results[i].settingName == currentSchemeName){
        				$('#saveDialogNameDouble').css({"display":"block"}); 
        				checkDuplicate = true;
        			}
        		}
        		if(checkDuplicate == false){
        			saveCurrentScheme(); 
        		}
        	});	
        });    
    }
    /*
	function to safe the current colorscheme 
    */
    function saveCurrentScheme(){
    	var schemeName = $('#schemeName').val().replace(/^\s+|\s+$|\s+(?=\s)/g, "");
    	 if (schemeName == '') {
                alert("Bitte geben sie einen Namen ein")
            } else if (schemeName != '') {
            
                var name = schemeName; 
                var tmp = localStorage.getItem("colors"); 
                var settings = JSON.parse(tmp); 


                dpd.gridsettings.post({settingName:name,value:settings},function(result,error){
                });

                $('#saveDialog').css('display', 'none');
                $('#diasableBackground').css('display', 'none');
                //clear textfield
                $('#schemeName').val('');
            }
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

 /*  ###########################################################
 *  ##  Functions to handle the clicking on the boxes over the Canvas 
 *  ###########################################################*/
    /*
	function to manage when you click on the current station field
    */
    function selectCurrentStation(){
    	$('#selectedElement').on('click',function(){
    		if(currentStationClicked == false){
    			nodeId = currentSelectedStation;
    			currentStationClicked = true; 
    			standardStationClicked = false; 
    			standardConnectionCLicked = false;
    			disabledConnectionClicked = false; 
    			backgroundGridClicked = false; 
    			$('#selectedElement').css({"-webkit-box-shadow":"inset 0px 0px 0px 2px white",
    									"-moz-box-shadow":"inset 0px 0px 0px 2px white",
    									"box-shadow":"inset 0px 0px 0px 2px white"});
    			$('#standardStation').css({"-webkit-box-shadow":"inset 0px 0px 0px 0px white",
    									"-moz-box-shadow":"inset 0px 0px 0px 0px white",
    									"box-shadow":"inset 0px 0px 0px 0px white"});
    			$('#standardConnection').css({"-webkit-box-shadow":"inset 0px 0px 0px 0px white",
    									"-moz-box-shadow":"inset 0px 0px 0px 0px white",
    									"box-shadow":"inset 0px 0px 0px 0px white"});
    			$('#disabledConnection').css({"-webkit-box-shadow":"inset 0px 0px 0px 0px white",
    									"-moz-box-shadow":"inset 0px 0px 0px 0px white",
    									"box-shadow":"inset 0px 0px 0px 0px white"});
    			$('#backgroundGrid').css({"-webkit-box-shadow":"inset 0px 0px 0px 0px white",
    									"-moz-box-shadow":"inset 0px 0px 0px 0px white",
    									"box-shadow":"inset 0px 0px 0px 0px white"});

    			var colors = JSON.parse(localStorage.getItem("colors"));
    			var colorHex = colors[currentSelectedStation]; 
    			var colorRgb = hexToRgb(colorHex);
    			
    			var colorHsl = rgb2hsl(colorRgb);
    			updateRgbRange(colorRgb[0],colorRgb[1],colorRgb[2],colorHsl[0],colorHsl[2],colorHsl[1]);
    			updateRgbValues(colorRgb[0],colorRgb[1],colorRgb[2],colorHsl[0],colorHsl[1],colorHsl[2]);
    			updateRgbValueHex(colorRgb[0],colorRgb[1],colorRgb[2]);
    			clearCircle(); 
    		}
    	});
    }
    
    /*
	function to manage when you click on the standart station field
    */
    function selectStandartStation(){
    	$('#standardStation').on('click',function(){
    		if(standardStationClicked == false){
    			nodeId = "ds";
    			standardStationClicked = true; 
    			currentStationClicked = false; 
    			standardConnectionCLicked = false;
    			disabledConnectionClicked = false; 
    			backgroundGridClicked = false; 
    			$('#standardStation').css({"-webkit-box-shadow":"inset 0px 0px 0px 2px white",
    									"-moz-box-shadow":"inset 0px 0px 0px 2px white",
    									"box-shadow":"inset 0px 0px 0px 2px white"});
    			$('#standardConnection').css({"-webkit-box-shadow":"inset 0px 0px 0px 0px white",
    									"-moz-box-shadow":"inset 0px 0px 0px 0px white",
    									"box-shadow":"inset 0px 0px 0px 0px white"});
    			$('#disabledConnection').css({"-webkit-box-shadow":"inset 0px 0px 0px 0px white",
    									"-moz-box-shadow":"inset 0px 0px 0px 0px white",
    									"box-shadow":"inset 0px 0px 0px 0px white"});
    			$('#backgroundGrid').css({"-webkit-box-shadow":"inset 0px 0px 0px 0px white",
    									"-moz-box-shadow":"inset 0px 0px 0px 0px white",
    									"box-shadow":"inset 0px 0px 0px 0px white"});
    			$('#selectedElement').css({"-webkit-box-shadow":"inset 0px 0px 0px 0px white",
    									"-moz-box-shadow":"inset 0px 0px 0px 0px white",
    									"box-shadow":"inset 0px 0px 0px 0px white"});

    			var colors = JSON.parse(localStorage.getItem("colors"));
    			var colorHex = colors["ds"]; 
    			var colorRgb = hexToRgb(colorHex);
    			
    			var colorHsl = rgb2hsl(colorRgb);
    			updateRgbRange(colorRgb[0],colorRgb[1],colorRgb[2],colorHsl[0],colorHsl[2],colorHsl[1]);
    			updateRgbValues(colorRgb[0],colorRgb[1],colorRgb[2],colorHsl[0],colorHsl[1],colorHsl[2]);
    			updateRgbValueHex(colorRgb[0],colorRgb[1],colorRgb[2]);
    			clearCircle(); 

    			$('#standardStationColor').css({"backgroundColor":colorHex}); 

    		}
    	});
    }
    /*
	function to manage when you click on the standart connection field
    */
    function selectStandartConnection(){
    	$('#standardConnection').on('click', function(){
    		if(standardConnectionCLicked == false){
    			nodeId = "uc";
    			standardConnectionCLicked = true; 
    			currentStationClicked = false; 
    			standardStationClicked = false; 
    			disabledConnectionClicked = false; 
    			backgroundGridClicked = false; 
    			$('#standardConnection').css({"-webkit-box-shadow":"inset 0px 0px 0px 2px white",
    									"-moz-box-shadow":"inset 0px 0px 0px 2px white",
    									"box-shadow":"inset 0px 0px 0px 2px white"});
    			$('#standardStation').css({"-webkit-box-shadow":"inset 0px 0px 0px 0px white",
    									"-moz-box-shadow":"inset 0px 0px 0px 0px white",
    									"box-shadow":"inset 0px 0px 0px 0px white"});
    			$('#disabledConnection').css({"-webkit-box-shadow":"inset 0px 0px 0px 0px white",
    									"-moz-box-shadow":"inset 0px 0px 0px 0px white",
    									"box-shadow":"inset 0px 0px 0px 0px white"});
    			$('#backgroundGrid').css({"-webkit-box-shadow":"inset 0px 0px 0px 0px white",
    									"-moz-box-shadow":"inset 0px 0px 0px 0px white",
    									"box-shadow":"inset 0px 0px 0px 0px white"});
    			$('#selectedElement').css({"-webkit-box-shadow":"inset 0px 0px 0px 0px white",
    									"-moz-box-shadow":"inset 0px 0px 0px 0px white",
    									"box-shadow":"inset 0px 0px 0px 0px white"});

    			var colors = JSON.parse(localStorage.getItem("colors"));
    			var colorHex = colors["uc"]; 
    			var colorRgb = hexToRgb(colorHex);
    			
    			var colorHsl = rgb2hsl(colorRgb);
    			updateRgbRange(colorRgb[0],colorRgb[1],colorRgb[2],colorHsl[0],colorHsl[2],colorHsl[1]);
    			updateRgbValues(colorRgb[0],colorRgb[1],colorRgb[2],colorHsl[0],colorHsl[1],colorHsl[2]);
    			updateRgbValueHex(colorRgb[0],colorRgb[1],colorRgb[2]);
    			clearCircle(); 
    		}
    	});
    }
    /*
	function to manage when you click on the disabled connection field
    */
    function selectDisabledConnection(){
    	$('#disabledConnection').on('click',function(){
    		if(disabledConnectionClicked == false){
    			nodeId = "dc";
    			disabledConnectionClicked = true;
    			currentStationClicked = false; 
    			standardStationClicked = false; 
    			standardConnectionCLicked = false;
    			backgroundGridClicked = false; 
    			$('#disabledConnection').css({"-webkit-box-shadow":"inset 0px 0px 0px 2px white",
    									"-moz-box-shadow":"inset 0px 0px 0px 2px white",
    									"box-shadow":"inset 0px 0px 0px 2px white"});
    			$('#standardStation').css({"-webkit-box-shadow":"inset 0px 0px 0px 0px white",
    									"-moz-box-shadow":"inset 0px 0px 0px 0px white",
    									"box-shadow":"inset 0px 0px 0px 0px white"});
    			$('#standardConnection').css({"-webkit-box-shadow":"inset 0px 0px 0px 0px white",
    									"-moz-box-shadow":"inset 0px 0px 0px 0px white",
    									"box-shadow":"inset 0px 0px 0px 0px white"});
    			$('#backgroundGrid').css({"-webkit-box-shadow":"inset 0px 0px 0px 0px white",
    									"-moz-box-shadow":"inset 0px 0px 0px 0px white",
    									"box-shadow":"inset 0px 0px 0px 0px white"});
    			$('#selectedElement').css({"-webkit-box-shadow":"inset 0px 0px 0px 0px white",
    									"-moz-box-shadow":"inset 0px 0px 0px 0px white",
    									"box-shadow":"inset 0px 0px 0px 0px white"});

    			var colors = JSON.parse(localStorage.getItem("colors"));
    			var colorHex = colors["dc"]; 
    			var colorRgb = hexToRgb(colorHex);
    			
    			var colorHsl = rgb2hsl(colorRgb);
    			updateRgbRange(colorRgb[0],colorRgb[1],colorRgb[2],colorHsl[0],colorHsl[2],colorHsl[1]);
    			updateRgbValues(colorRgb[0],colorRgb[1],colorRgb[2],colorHsl[0],colorHsl[1],colorHsl[2]);
    			updateRgbValueHex(colorRgb[0],colorRgb[1],colorRgb[2]);
    			clearCircle(); 
    		}
    	});
    }
    /*
	function to manage when you click on the background field
    */
    function selectBackgroundGrid(){
    	$('#backgroundGrid').on('click',function(){
    		if(backgroundGridClicked == false){
    			nodeId = "bg"; 
    			backgroundGridClicked = true; 
    			currentStationClicked = false; 
    			standardStationClicked = false; 
    			standardConnectionCLicked = false;
    			disabledConnectionClicked = false; 
    			$('#backgroundGrid').css({"-webkit-box-shadow":"inset 0px 0px 0px 2px white",
    									"-moz-box-shadow":"inset 0px 0px 0px 2px white",
    									"box-shadow":"inset 0px 0px 0px 2px white"});
    			$('#standardStation').css({"-webkit-box-shadow":"inset 0px 0px 0px 0px white",
    									"-moz-box-shadow":"inset 0px 0px 0px 0px white",
    									"box-shadow":"inset 0px 0px 0px 0px white"});
    			$('#standardConnection').css({"-webkit-box-shadow":"inset 0px 0px 0px 0px white",
    									"-moz-box-shadow":"inset 0px 0px 0px 0px white",
    									"box-shadow":"inset 0px 0px 0px 0px white"});
    			$('#disabledConnection').css({"-webkit-box-shadow":"inset 0px 0px 0px 0px white",
    									"-moz-box-shadow":"inset 0px 0px 0px 0px white",
    									"box-shadow":"inset 0px 0px 0px 0px white"});
    			$('#selectedElement').css({"-webkit-box-shadow":"inset 0px 0px 0px 0px white",
    									"-moz-box-shadow":"inset 0px 0px 0px 0px white",
    									"box-shadow":"inset 0px 0px 0px 0px white"});

    			var colors = JSON.parse(localStorage.getItem("colors"));
    			var colorHex = colors["bg"]; 
    			var colorRgb = hexToRgb(colorHex);
    			
    			var colorHsl = rgb2hsl(colorRgb);
    			updateRgbRange(colorRgb[0],colorRgb[1],colorRgb[2],colorHsl[0],colorHsl[2],colorHsl[1]);
    			updateRgbValues(colorRgb[0],colorRgb[1],colorRgb[2],colorHsl[0],colorHsl[1],colorHsl[2]);
    			updateRgbValueHex(colorRgb[0],colorRgb[1],colorRgb[2]);
    			clearCircle(); 

    		}
    	});
    }

    /*  ###########################################################
 *  ##  Helping functions
 *  ###########################################################*/
 	/*
	this function changes the cursor style on the labels
   	*/
    function changeCursorsOnLabels(){
    	$('#rbgLabelR').css({"cursor":"pointer"}); 
    	$('#rbgLabelG').css({"cursor":"pointer"}); 
    	$('#rbgLabelB').css({"cursor":"pointer"}); 
    	$('#rbgLabelH').css({"cursor":"pointer"}); 
    	$('#rbgLabelS').css({"cursor":"pointer"}); 
    	$('#rbgLabelHex').css({"cursor":"default"}); 
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
     Method to get the drawn circle away by just clearing the canvas and redrawing the
     image on it 
    */
    function clearCircle() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
    }

   
});


 

   

   	
    


    
    
    

    


