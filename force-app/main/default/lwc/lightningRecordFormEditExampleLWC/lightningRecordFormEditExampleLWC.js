import { LightningElement,api } from 'lwc';

import NAME_FIELD from '@salesforce/schema/Account.Name';
import REVENUE_FIELD from '@salesforce/schema/Account.AnnualRevenue';
import INDUSTRY_FIELD from '@salesforce/schema/Account.Industry';
/* eslint-disable no-console */
 /* eslint-disable no-alert */
export default class LightningRecordFormEditExampleLWC extends LightningElement {
    @api recordId;
    @api objectApiName;
    @api field1;
    @api field2;
    @api field3;    
    //fields = [field1, field2, field3];
     fields = [NAME_FIELD, REVENUE_FIELD, INDUSTRY_FIELD];
     
    handleSubmit(event){
        
        //you can change values from here
        //const fields = event.detail.fields;
        //fields.Name = 'My Custom  Name'; // modify a field
        console.log('Account detail : ',event.detail.fields);
        console.log('Account name : ',event.detail.fields.Name);
    }
}