

	   /////////////////////////// d_series //////////////////////////////////////////////////////////////////////
	   
	   
	   function  D_Series(){		      
		      
		      // prefix
		      
		      this.key_id	= 'key_id_';
		      
		      this.nd_wall	= 'nd_wall_';
		      
		      this.nd_ground 	= 'nd_ground_';
		      
		      this.row_id 	= 'row_id_';
                      
                      this.last_key     = '';
		      
		      
	   } // d_series	   
	   
	   	   
	   //////////////////////////////////////////////////////////////////////////////////////////////////////////
	   ///	Name		: set_nd_content
	   ///	Short Brief	: set HTML content to narrow down ground
	   ///	i/p		: {ele_idx:'<element_idx>',content:'<content>'}
	   ///	o/p		: set/clear content based on display	   
	   //////////////////////////////////////////////////////////////////////////////////////////////////////////
	   
	   D_Series.prototype.set_nd_content=function(param){
                      
		      var lv 			= new Object({});
                    
		      lv.key_id              	= document.getElementById(this.key_id+param.ele_idx).value;
                      
		      lv.narrow_down_area   	= document.getElementById(this.nd_wall+lv.key_id);
                      
                      lv.narrow_down_area.state = lv.narrow_down_area.style.display;
                      
                      lv.narrow_down_element	= document.getElementById(this.nd_ground+lv.key_id);
                      
		      // check for new team
                      
                      if((param.key!=this.last_key) ||
                         ((param.key==this.last_key) && (lv.narrow_down_area.state=='none'))){                         
                                 
                                 
                                 
                                 lv.narrow_down_gate       = '';
                                 
                                 // title
                                 
                                 if(param.title!=undefined){
                                 
                                            lv.narrow_down_gate       = '<div class="box_gate ">'+
                                                                             '<div class="clr_box_gray_5 pad_7 pad_tb txt_int_50">'+param.title+'</div>'+
                                                                             '<div class="clr_box_red pad_7 pad_tb"><a href="JavaScript:d_series.nd_close(\''+lv.narrow_down_area.id+'\');">X</a></div>'+
                                                                        '</div>';
                                 }
                                        
                                 lv.narrow_down_area.style.display	= 'table-row';
                               
                                 lv.narrow_down_area.style.width	= '100%';
                                 
                                 lv.narrow_down_element.innerHTML 	= lv.narrow_down_gate+param.content;
                                 
                                 document.location.href			= "#"+this.row_id+""+param.ele_idx+"_1";
                                
                                 
                      }else{ // existing and opened
                      
                      
                                 if(lv.narrow_down_area.state=='table-row'){
                                            
                                     lv.narrow_down_element.innerHTML  	= '';
                                     
                                     lv.narrow_down_area.style.display 	= 'none';                                                                          
                                 }
                      
                      } // end key check
                      
                      // store current key
                      
                      this.last_key                         = param.key;
		      
	   } // end
	   
	   // get key_id
	   
	   D_Series.prototype.get_key_id=function(ele_idx){
                      
                      
                      
		      if(is_element_exists(this.key_id+ele_idx)){
                                 
				 return  document.getElementById(this.key_id+ele_idx).value;
                                 
                                 
		      }else{
				 
				 alert('Undefined element call');
				 return false;
		      }
	   } // end
           
           
           // close
	   
	   D_Series.prototype.nd_close=function(wall_id){
                      
                      
                      
		      if(is_element_exists(wall_id)){
                                 
                                 document.getElementById(wall_id).style.display = 'none';
                                 //param.ground.innerHTML           = 'none';                                 
                                 
                                 
		      }else{				 
				 alert('Undefined element call');
				 
		      }
	   } // close
           
           
	   
	   
	   // default call
	   
	   var d_series = new D_Series();
	   
	 