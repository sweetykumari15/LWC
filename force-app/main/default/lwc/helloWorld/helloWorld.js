import { LightningElement } from 'lwc';

export default class HelloWorld extends LightningElement {
    greeting='My First LWC!!';
    changeHandler(event) {
        
        this.greeting = event.target.value;
      }
}