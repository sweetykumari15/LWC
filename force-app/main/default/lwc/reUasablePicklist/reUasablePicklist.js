import { LightningElement, api, track, wire } from 'lwc';
import { getPicklistValuesByRecordType, getObjectInfo } from 'lightning/uiObjectInfoApi';
export default class GenericDependentPicklist extends LightningElement {
   @api
   objectApiName;
   //An Api Name for Controlling PickList Field
   @api
   controllingPicklistApiName;
   //An Api Name for Dependent Picklist for any Object
   @api
   dependentPicklistApiName;
   // to show the label for the dependent field
   @api
   dependentPicklistLabel;
   // to show the label for the controlling field
   @api
   controllingPicklistLabel;
   //An Object to fill show user all available options
   @track
   optionValues = {controlling:[], dependent:[]};
   //To fill all controlling value and its related valid values
   allDependentOptions={};
   //To hold what value, the user selected.
   @track
   selectedValues = {controlling:undefined, dependent:undefined};
   //Invoke in case of error.
   isError = false;
   errorMessage;
   //To Disable Dependent PickList until the user won't select any parent picklist.
   isDisabled = true;
   @wire(getObjectInfo, {objectApiName : '$objectApiName'})
   objectInfo;
   @wire(getPicklistValuesByRecordType, { objectApiName: '$objectApiName', recordTypeId: '$objectInfo.data.defaultRecordTypeId'})
   fetchValues({error, data}){
       if(!this.objectInfo){
           this.isError = true;
           this.errorMessage = 'Please Check You Object Settings';
           return;
       }
       if(data && data.picklistFieldValues){
           try{
               this.setUpControllingPicklist(data);
               this.setUpDependentPickList(data);
           }catch(err){
               this.isError = true;
               this.errorMessage = err.message;
           }
       }else if(error){
           this.isError = true;
           this.errorMessage = 'Object is not configured properly please check';
       }
   }
   //Method to set Up Controlling Picklist
   setUpControllingPicklist(data){
       this.optionValues.controlling = [{ label:'None', value:'' }];
       if(data.picklistFieldValues[this.controllingPicklistApiName]){
           data.picklistFieldValues[this.controllingPicklistApiName].values.forEach(option => {
               this.optionValues.controlling.push({label : option.label, value : option.value});
           });
           if(this.optionValues.controlling.length == 1)
               throw new Error('No Values Available for Controlling PickList');
       }else
           throw new Error('Controlling Picklist doesn\'t seems right');
   }
   //Method to set up dependent picklist
   setUpDependentPickList(data){
       if(data.picklistFieldValues[this.dependentPicklistApiName]){
           if(!data.picklistFieldValues[this.dependentPicklistApiName].controllerValues){
               throw new Error('Dependent PickList does not have any controlling values');
           }
           if(!data.picklistFieldValues[this.dependentPicklistApiName].values){
               throw new Error('Dependent PickList does not have any values');
           }
           this.allDependentOptions = data.picklistFieldValues[this.dependentPicklistApiName];
       }else{
           throw new Error('Dependent Picklist Doesn\'t seems right');
       }
   }
   handleControllingChange(event){
       const selected = event.target.value;
       if(selected && selected != 'None'){
           this.selectedValues.controlling = selected;
           this.selectedValues.dependent = null;
           this.optionValues.dependent = [{ label:'None', value:'' }];
           let controllerValues = this.allDependentOptions.controllerValues;
           this.allDependentOptions.values.forEach( val =>{
               val.validFor.forEach(key =>{
                   if(key === controllerValues[selected]){
                       this.isDisabled = false;
                       this.optionValues.dependent.push({label : val.label, value : val.value});
                   }
               });
           });

           const selectedrecordevent = new CustomEvent(
                "selectedpicklists", {
                    detail : { pickListValue : this.selectedValues}
                }
            );
            this.dispatchEvent(selectedrecordevent);

           if(this.optionValues.dependent && this.optionValues.dependent.length > 1){

           }
           else{
               this.optionValues.dependent = [];
               this.isDisabled = true;
           }
       }else{
           this.isDisabled = true;
           this.selectedValues.dependent = [];
           this.selectedValues.controlling = [];
       }
   }
   handleDependentChange(event){
       this.selectedValues.dependent = event.target.value;
       const selectedrecordevent = new CustomEvent(
           "selectedpicklists",
           {
               detail : { pickListValue : this.selectedValues}
           }
       );
       this.dispatchEvent(selectedrecordevent);
       //sendDataToParent();
   }
}