/*
 save session is a java script for Acrobat Reader
 based on save tabs by Andrey Kartashov found on
*/

var delim = '|';
var parentMenu = "Window";
var openMenu = "&Open Session"
var deleteMenu = "&Delete Session"

// Dialog Definition 
var oDlg = {
	strName: "SessionName", 
	initialize: function(dialog) { 
					dialog.load({"usnm":this.strName}); 
				} ,
    commit: function(dialog) { 
              var data = dialog.store();
              this.strName = data["usnm"];
		    },
    description: { name: "Test Dialog", elements: 
					[	
						{ type: "view", elements: 
							[
								{ name: "Enter your name:", type: "static_text", },
								{ item_id: "usnm", type: "edit_text", char_width: 40 },
								{ type: "ok_cancel", },
							]
						},
					] 
				}	
};

function AddSession(name){	
	
 	app.addMenuItem({
	  cName: "open"+name,
	  cUser: name,
	  cParent: openMenu,
	  cExec: "LoadTabs(\""+ name +"\");"
	});
	
	app.addMenuItem({
	  cName: "del"+name,
	  cUser: name,
	  cParent: deleteMenu,
	  cExec: "DeleteTab(\"" + name +"\");"
	}); 
	
	
}

/*
 Loading Saved Tabs
*/


function LoadTabs(session) {

  if (global.tabs_opened == null) {
    return;
  }

  var flat = global.tabs_opened[session].split(delim);
  for (i = 0; i < flat.length; i += 2) {
    try {
      app.openDoc(flat[i]);
      app.execMenuItem("FirstPage");
      for (ii = 0; ii < flat[i + 1]; ++ii) {
        app.execMenuItem("NextPage");
      }
    } catch (ee) {
      app.alert("Error while opening the requested document.\n" + flat[i], 3);
    }
  }
}

function DeleteTab(name){
	
	if(app.alert("Are you shure you wnat to delete " + name + " ?", 2, 2, "Submit Validation") == 4){
		app.hideMenuItem("open"+name);
		app.hideMenuItem("del"+name);
		delete global.tabs_opened[name];
		global.setPersistent("tabs_opened", true);
	}
}


/*
 Function with trusted section returning opened documents
*/
trustedActiveDocs = app.trustedFunction(function () {
  app.beginPriv();
  var d = app.activeDocs;
  app.endPriv();
  return d;
})

/*
 Saving Tabs that are opened
*/
function SaveSession() {
	
 
  var d = trustedActiveDocs();
  var tabs = '';
  
  if(app.execDialog(oDlg) == "ok") {
	  
	  var nRslt = 4
	  var already_exists = oDlg.strName in global.tabs_opened;
	  if(already_exists)
		nRslt = app.alert("A session with that name already exists...\n\n" + "Do you want to continue?", 2, 2, "Submit Validation");
	  
	  console.println(nRslt);
	  
	  if(nRslt == 4){
	  
		  var session = oDlg.strName;
		  
		  if(d.length == 0){
			  app.alert("No documents opened to save session!", 3);
		  }
	  
			for (var i = 0; i < d.length; i++) {
				if (i > 0)
				  tabs += delim;
				//    app.alert(d[i].path+"------"+d[i].pageNum,3);
				tabs += d[i].path;
				tabs += delim;
				tabs += d[i].pageNum;
			}
		  
		  	global.tabs_opened[session] = tabs
			global.setPersistent("tabs_opened", true);
			if(!already_exists)
				AddSession(session, tabs) 	
		}
  }
} 
  

if(global.tabs_opened == null){
	 global.tabs_opened = []
	 global.setPersistent("tabs_opened", true);
}

app.addMenuItem({
  cName: "-",
  cParent: parentMenu,
  cExec: "void(0);"
});

app.addMenuItem({
  cName: "&Save Session",
  cParent: parentMenu,
  cExec: "SaveSession();"
});

app.addSubMenu({
  cName: openMenu,
  cParent: parentMenu,
});

app.addSubMenu({
  cName: deleteMenu,
  cParent: parentMenu,
});

for (key in global.tabs_opened) {
	AddSession(key);
}
