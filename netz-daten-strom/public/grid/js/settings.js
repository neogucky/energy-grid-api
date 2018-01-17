/*
    This script contains functionalities for the settings page
*/
var nodeId; 



function onSelectedSubstationChanged(id){
    nodeId = id; 
    var backgroundColors = localStorage.getItem("colors");
    var backgroundColorsParsed = JSON.parse(backgroundColors);
    var backgroundColor = backgroundColorsParsed[nodeId];
    $('#currentColor').css({"backgroundColor":backgroundColor}); 
    currentStationClicked = true; 

    standardStationClicked = false; 
    standardConnectionCLicked = false;
    disabledConnectionClicked = false; 
    backgroundGridClicked = false; 

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

    var api = window.frames[0].getApi();  
    var stationName = api.findObjectById(api.nodes, nodeId).data.name;

    document.getElementById("selectedElementP-tag").innerHTML = stationName; 

    var colors = JSON.parse(localStorage.getItem("colors"));
     
    var currentColorHex = colors[nodeId];

    manageRangeHexValueUpdate(currentColorHex); 

    if(nodeId!="bg"&&nodeId!="ds"&&nodeId!="dc"&&nodeId!="uc"){
    	currentSelectedStation = nodeId; 
    }
}



function onLoad() {
    document.getElementById("grid-container").innerHTML = '<object width="100%" height="100%" id="container" type="type/html" data="grid.html?s=1" ></object>';
}





//The variable in which the grid colors will be saved
var gridColor = {};
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

var isUpdating = false; 
var currentSelectedStation; 

/*
loads the color picker png into the canvas and implements the click function on it. Everthing else is in the .ready() so that we make 
sure the document is completly loaded before other methods work
*/
$(document).ready(function () {
    try{
    	colorschemes = new DPDStore('colorschemes', function() {});
    	colorschemes.connect(); 
    }catch(err){
    	//alert("no conection to the Api"); 
    }

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

    	pixelColorArrayHsl[0] = h;
        pixelColorArrayHsl[1] = s;
        pixelColorArrayHsl[2] = l; 
       	
        updateColor();

        updateRgbValues(data[0], data[1], data[2],h, l,s);
        updateRgbRange(data[0], data[1], data[2],h, l,s);
        updateRgbValueHex(data[0],data[1],data[2]); 

        drawCircle(context, actualX, actualY);
        
       
    });

    function initialColoringOfFields(){
        var backgroundColors = localStorage.getItem("colors");
        var backgroundColorsParsed = JSON.parse(backgroundColors);
        $('#standardStationColor').css({"backgroundColor":backgroundColorsParsed["ds"]}); 
        $('#standardConnectionColor').css({"backgroundColor":backgroundColorsParsed["uc"]}); 
        $('#disabledConnectionColor').css({"backgroundColor":backgroundColorsParsed["dc"]});
        $('#backgroundGridnColor').css({"backgroundColor":backgroundColorsParsed["bg"]});  
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
        	if(clicked == false && mouseDown != true){
        		$(canvas).css({"cursor":"-webkit-grab"});
        	}
            if (clicked == false && mouseDown == true) {
                $(canvas).css({"cursor":"-webkit-grabbing"});
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

                pixelColorArrayHsl[0] = h;
                pixelColorArrayHsl[1] = s;
                pixelColorArrayHsl[2] = l; 
		        
		    	pixelColorHsl = "hsl("+h+", "+s+"%"+", "+l+"%"+")"; 


                updateColor();

                updateRgbValues(data[0], data[1], data[2],h, l,s);
                updateRgbRange(data[0], data[1], data[2],h, l,s);
                updateRgbValueHex(data[0],data[1],data[2]); 

                drawCircle(context, actualX, actualY);
            }
        });
    }

    /**
    Important: Call ButtonHandlers before call InputHandlers, otherwise InputHandlers Overwrite Buttonhandlers
    **/
    onLoad(); 
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

    //the Event-Handler-Fkt for the rgb Ranges and input-fields, Call them AFTER the Button Handlers
    inputRangeChanges();
    inputFieldChanges();
    hexInputChanges(); 
    hsInputChanges(); 

    /*
    this function tranfers rgb values to one hex value
    */
    function rgb2hex(red, green, blue) {
        var rgb = blue | (green << 8) | (red << 16);
        return '#' + (0x1000000 + rgb).toString(16).slice(1)
    }

    function hexToRgb(hex){
        var hex = hex.replace('#','');
        r = parseInt(hex.substring(0,2), 16);
        g = parseInt(hex.substring(2,4), 16);
        b = parseInt(hex.substring(4,6), 16);

        result = [];
        result[0] = r;
        result[1] = g;
        result[2] = b;
        //result = 'rgba('+r+','+g+','+b+')';
        return result;
    }


    /*
    thi function converts hsl values in hex values
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
        /*
        document.getElementById("rgb-Alpha").value = Math.round(l)/100;
        document.getElementById("rgb-Saturation").value = Math.round(s)/100;
        */ 

    }


    function updateJustRgbRange(red, green, blue){
    	document.getElementById("rgb-Red").value = red;
        document.getElementById("rgb-Green").value = green;
        document.getElementById("rgb-Blue").value = blue;
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
       	//input[3] = document.getElementById("rgb-Alpha");
        //input[4] = document.getElementById("rgb-Saturation"); 

        for (var i = 0; i < input.length; i++) {
            input[i].addEventListener("input", function () {
                var red = document.getElementById("rgb-Red").value,
                    green = document.getElementById("rgb-Green").value,
                    blue = document.getElementById("rgb-Blue").value,
                    //alpha = document.getElementById("rgb-Alpha").value;
                    //saturation = document.getElementById("rgb-Saturation").value;

                rgbArray = [];
                rgbArray[0] = red; 
                rgbArray[1] = green; 
                rgbArray[2] = blue; 
		        
		        var tmp = rgb2hsl(rgbArray); 
		        var h = tmp[0]; 
		        var s = tmp[1]; 
		        var l = tmp[2]; 
		        

		        /*
		        var h = rgb2hsl(rgbArray)[0]; 
		        var s = saturation*100;
		        var l = alpha*100; 
				*/
                pixelColorArrayHsl[0] = h;
                pixelColorArrayHsl[1] = s;
                pixelColorArrayHsl[2] = l; 
		         
		    	pixelColorHsl = "hsl("+h+", "+s+"%"+", "+l+"%"+")";
		    	
                pixelColorArray[0] = red;
                pixelColorArray[1] = green;
                pixelColorArray[2] = blue;

                //pixelColor = "rgba(" + red + ", " + green + ", " + blue + ", " + alpha + ")";

                updateColor();
                updateRgbValues(red, green, blue,h, l,s);
                //updateRgbRange(red, green, blue,h, l,s);
                
                var tmp = hexToRgb(hslToHex(h,s,l));

                updateRgbValueHex(tmp[0],tmp[1],tmp[2]); 
               

                clearCircle();

            });
        }
    }

   
    function hsInputChanges(){

    	 var input = [];

    	input[0] = document.getElementById("rgb-Alpha");
        input[1] = document.getElementById("rgb-Saturation"); 

        for (var i = 0; i < input.length; i++) {
            input[i].addEventListener("input", function () {
                    alpha = document.getElementById("rgb-Alpha").value;
                    saturation = document.getElementById("rgb-Saturation").value;



	                rgbArray = [];
	                rgbArray[0] = red; 
	                rgbArray[1] = green; 
	                rgbArray[2] = blue; 
			        var h = pixelColorArrayHsl[0]
			        var s = saturation*100;
			        var l = alpha*100; 

	                pixelColorArrayHsl[0] = h;
	                pixelColorArrayHsl[1] = s;
	                pixelColorArrayHsl[2] = l; 
			         
			    	pixelColorHsl = "hsl("+h+", "+s+"%"+", "+l+"%"+")";

			    	
			    	
			    	var tmpRgb = hexToRgb(hslToHex(h,saturation*100,alpha*100)); 
			    	

	                pixelColorArray[0] = tmpRgb[0];
	                pixelColorArray[1] = tmpRgb[1];
	                pixelColorArray[2] = tmpRgb[2];


	                var red = tmpRgb[0];
	                var green = tmpRgb[1];
	                var blue = tmpRgb[2];

	                pixelColor = "rgba(" + tmpRgb[0] + ", " + tmpRgb[1] + ", " + tmpRgb[2] + ", " + alpha + ")";

	                updateColor();
	                updateRgbValues(red, green, blue,h, l,s);
	               	updateJustRgbRange(red,green,blue); 
	                
	                var tmp = hexToRgb(hslToHex(h,s,l));

	                updateRgbValueHex(tmp[0],tmp[1],tmp[2]); 
	               

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

                    //alpha = rgb2hsv(red,green,blue).s;
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

    function resetAllElements(){
        $('#resetAllElements').click(function(){
            var defaultColors = getDefaultColors();
            console.log("defaultColors= "+JSON.stringify(defaultColors)); 
            colors = localStorage.getItem("colors"); 
            colorsParsed = JSON.parse(colors); 
            var defaultColorsParsed = JSON.parse(JSON.stringify(defaultColors)); 

           
            localStorage.setItem("colors",JSON.stringify(defaultColors)); 
           
            window.frames[0].recolorGrid();

            var tmp = JSON.parse(localStorage.getItem("colors"));

            console.log("tmp = "+JSON.stringify(tmp));
            
            hex = tmp["bg"];

           

            $('#currentColor').css({"backgroundColor":tmp[currentSelectedStation]}); 
            $('#backgroundGridnColor').css({"backgroundColor":tmp["bg"]}); 
            $('#disabledConnectionColor').css({"backgroundColor":tmp["dc"]}); 
            $('#standardConnectionColor').css({"backgroundColor":tmp["uc"]}); 
            $('#standardStationColor').css({"backgroundColor":tmp["ds"]}); 


            clearCircle(); 
                
            
        });
    }

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
    

    // Get a random Hex Color (yes its ugly but it supports infinite colors)
    function getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
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
	click function to display or hide the load dialog by clicking on the load Button under
    the Color Selection. And Then load the Data from the Api and display all the different 
    color schemes in the select boxes 
    */
    function showLoadDialoge() {
        $('#loadScheme').click(function (event) {
            
            if ($('#loadDialog').css('display') == 'none') {
                var colorTmp; 
                dpd.colorscheme.get(function(results,error){
                    namesTmp = results; 

                    var selectElement = document.getElementById('schemeNameSelect');
                    
                    for(var i=0;i<namesTmp.length;i++){
                        var option = new Option(namesTmp[i].name, i);
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
    this function manages the saving of the current color scheme
    */
    function saveDialog() {
        $('#dialogSaveSchemeBtn').click(function () {
            
            if ($('#schemeName').val() == '') {
                alert("Bitte geben sie einen Namen ein")
            } else if ($('#schemeName').val() != '') {

                var name = $('#schemeName').val(); 
                var tmp = localStorage.getItem("colors"); 
                var settings = JSON.parse(tmp); 


                dpd.colorscheme.post({name:name,settings:settings},function(result,error){
                });

                $('#saveDialog').css('display', 'none');
                $('#diasableBackground').css('display', 'none');
                //clear textfield
                $('#schemeName').val('');
            }

        });
    }
    
   
    /*
	This function is activatet when the user clicks on the load button in the depending dialoge.
	It gets the colorschemes from the api and saves them in a variable, then it returns the colorscheme which the 
	user has selected. 
    */
    function loadColorSchemes(){
        $('#dialogLoadSchemeBtn').on('click', function(){
            dpd.colorscheme.get(function(results,error){
                var selectedSchemeName = document.getElementById("schemeNameSelect").options[document.getElementById("schemeNameSelect").value].innerHTML; 
                var selectedScheme; 
                for(var i = 0; i < results.length;i++){
                    if(selectedSchemeName == results[i].name){
                        selectedScheme = results[i];  
                        var tmp = JSON.stringify(selectedScheme.settings);

                        localStorage.setItem("colors",tmp); 
                    
                        window.frames[0].recolorGrid(); 
                        $('#loadDialog').css('display', 'none');
                        $('#diasableBackground').css('display', 'none');

                        if(nodeId != undefined){
                       		$('#currentColor').css({"backgroundColor":selectedScheme.settings[nodeId]});
                        }

                        $('#standardStationColor').css({"backgroundColor":selectedScheme.settings["ds"]});
                        $('#disabledConnectionColor').css({"backgroundColor":selectedScheme.settings["dc"]});
                        $('#backgroundGridnColor').css({"backgroundColor":selectedScheme.settings["bg"]});
                    }
                }
            });

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
   
});


