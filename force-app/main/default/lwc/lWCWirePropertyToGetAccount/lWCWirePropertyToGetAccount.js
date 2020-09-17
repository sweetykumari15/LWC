/*Wire an apex method to a property
import { LightningElement, wire } from 'lwc';

import  getAccountData from '@salesforce/apex/GetAccountData.getAccountData';
export default class LWCWirePropertyToGetAccount extends LightningElement {
    @wire(getAccountData) accounts;
    
}
//Wire an apex method to Function
import { LightningElement, wire,track } from 'lwc';
import getAccountData from '@salesforce/apex/GetAccountData.getAccountData';
 
export default class LWCWireEx extends LightningElement {
    @track accounts;
    @track error;
    @wire(getAccountData)
    wiredAccounts({ error, record }) {
        if (record) {
            this.accounts = record;
        } else if (error) {
            console.log(error);
            this.error = error;
        }
    }
}*/

//Wire an apex method imperatively
import { LightningElement, wire,track,api} from 'lwc';
import getAccountData from '@salesforce/apex/GetAccountData.getAccountData';
import deleteAccounts from '@salesforce/apex/GetAccountData.deleteAccounts';
import updateAccount from '@salesforce/apex/GetAccountData.updateAccount';
import getFields from '@salesforce/apex/GetAccountData.getFields';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class ImperativEx extends LightningElement {

    @track isEdited = false;
    @track toggleSaveLabel = 'Save';
    @track myList = [
        {                      
            Name: '',
            Type: '',
            Rating: '',
            Phone:''
        }
    ];
    @track options = [];
    @track accounts;
    @track error;
    @track record = {};
    @track loadAccounts = false;
    @track TypePicklistValue;
    @track keyIndex = 0;  
    @wire(getFields, {objectName: {'sobjectType' : 'Account'},
    field: 'Type'})  typeValue;

    @wire(getFields, {objectName: {'sobjectType' : 'Account'},
    field: 'Rating'}) ratingValue;
    connectedCallback(){
        this.LoadAccountData();
    }

    LoadAccountData() {
        getAccountData()
            .then(result => {
                this.myList = result;
                this.loadAccounts= true;
            })
            .catch(error => {
                this.error = error;
            });
    }

    add() {
        console.log('length==> ' +this.myList.length);
        let newList= [...this.myList];
        newList.push({Name : "", Type : "",  Phone :'' , Rating : ""});
        this.isEdited=true;
        this.myList=newList;
    }

    remove(event) { 
        const indexPosition = event.currentTarget.name;
        const recId = event.currentTarget.dataset.id;
       
        console.log('indexPosition>>'+indexPosition);
        console.log('recId>>'+recId);
        if(recId != undefined){
            deleteAccounts({toDeleteId : recId})
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title : 'Success',
                    message : 'Record deleted succesfully!',
                    variant : 'success',
                }),
            )
            if(this.myList.length > 1) 
                 this.myList.splice(indexPosition, 1);
            this.error = undefined;
        })
        .catch(error => {
            this.error = error;
        })
        }else{
        console.log('else indexPosition>>'+indexPosition);
        let remoList=[];
        remoList= this.myList;
        remoList.splice(indexPosition,1);
        this.myList = remoList;
        }
        
    }
    //Save Accounts
    handleSave() {
        console.log("update myList "+JSON.stringify(this.myList));
        updateAccount({ records : this.myList })
            .then(result => {
                this.message = result;
                this.error = undefined;                
               /* this.myList.forEach(function(item){                   
                    item.Name='';
                    item.Type='';
					item.Rating='';
                    item.Phone='';                   
                });*/

                //this.myList = [];
                if(this.message !== undefined) {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Accounts Updated!',
                            variant: 'success',
                        }),
                    );
                }
                this.isEdited=false;
                console.log(JSON.stringify(result));
                console.log("result", this.message);
            })
            .catch(error => {
                this.message = undefined;
                this.error = error;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating records',
                        message: error.body.message,
                        variant: 'error',
                    }),
                );
                console.log("error", JSON.stringify(this.error));
            });
    }
    
    onDoubleClickEdit(){
        this.isEdited=true;
    }

    handleCancel() {
        this.isEdited = false;
    }
    
    handleNameChange(event){
        console.log('Name==> ' +event.target.accessKey);
        console.log('keyIndex==> ' +this.myList.length);
        console.log('myList==> ' +JSON.stringify(this.myList));
        let recordIds=JSON.parse(JSON.stringify(this.myList));
       
        if(event.target.name==='accName'){
            console.log('Name111==> ' +event.target.value);
            console.log('recordIds==> ' +recordIds);
            recordIds[event.target.accessKey].Name = event.target.value;
        }
        else if(event.target.name==='accType'){
            recordIds[event.target.accessKey].Type = event.target.value;
        }
        else if(event.target.name==='accPhone'){
            recordIds[event.target.accessKey].Phone = event.target.value;
        }
        else if(event.target.name==='accRating'){
            recordIds[event.target.accessKey].Rating = event.target.value;
        }
        this.myList= recordIds;
        console.log('myList0==> ' +this.myList[event.target.accessKey]);
        console.log('myList@@@==> ' +JSON.stringify(this.myList));
    }

    handleTypeChange(event)
    {   
        const selectedOption = event.detail.value;  
        getFields({ objectName:  '$objName', field : '$fieldName'})
        .then(result => {
            this.dataArray = result;
            let tempArray = [];
            this.dataArray.forEach(function (element) {
                var option=
                {
                    label:element.Label,
                    value:element.Name
                };
                tempArray.push(option);
            });
            this.options=tempArray;
        })
        .catch(error => {
            this.error = error;
        });

    }
}
