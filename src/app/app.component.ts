import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { ToWords } from 'to-words';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
const toWords = new ToWords({
  localeCode: 'en-IN',
  converterOptions: {
    currency: true,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
    doNotAddOnly: false,
    currencyOptions: { // can be used to override defaults for the selected locale
      name: 'Rupee',
      plural: 'Rupees',
      symbol: '₹',
      fractionalUnit: {
        name: 'Paisa',
        plural: 'Paise',
        symbol: '',
      },
    }
  }
});
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent  implements OnInit {
  
  title = 'cisko_invoice';
  createBillForm: FormGroup;
  subTotal: number
  totalAmountWithTax:number
  CGSTTaxAmount: number
  SGSTTaxAmount: number
  IGSTTaxAmount: number
  amountInWords: string
  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.createBillForm = this.fb.group({
      // items: this.fb.array([]),
      items: this.fb.array([
        this.initItem(),
      ]),
      CGSTPercentage: [null],
      SGSTPercentage: [null],
      IGSTPercentage: [null],
      invoiceNo: [''],
      transprtingMode: [''],
      reverseCharge: [''],
      vehicleNumber: [''],
      invoiceDate: [''],
      placeOfSupply: [''],
      receiverName: [''],
      receiverAddress: [''],
      receiverGSTIN: [''],
      receiverState: [''],
      receiverStateCode: [''],
      ConsigneeName: [''],
      ConsigneeAddress: [''],
      ConsigneeGSTIN: [''],
      ConsigneeState: [''],
      ConsigneeStateCode: [''],
      state: [''],
      stateCode: [''],





    });



  }
  get items(): FormArray {
    return this.createBillForm.get('items') as FormArray;
  }
  
  initItem() {
    return this.fb.group({
      product: [''],
      quantity: [0],
      hsn: [''],
      unit: [0],
      total: [0]
    });
  }

  public openPDF(): void {
    let DATA: any = document.getElementById('printTemplate');
    html2canvas(DATA, {
      scale: 4,
      allowTaint: true,
      useCORS: true,
    }).then((canvas) => {
      const FILEURI = canvas.toDataURL('image/jpeg', 0.6); // convert to JPEG with compression level 0.6
      let fileWidth = 210;
      let fileHeight = (canvas.height * fileWidth) / canvas.width;
      let PDF = new jsPDF('p', 'mm', 'a4');
      let position = 0;
      PDF.addImage(FILEURI, 'JPEG', 0, position, fileWidth, fileHeight);
      PDF.save(`${this.createBillForm.value.invoiceNo}.pdf`);
    });
  }
  

  calculateTotal(index: number): void {
    const items = this.createBillForm.get('items') as FormArray;
    console.log('items: ', items);
    const item = items.at(index) as FormGroup | null;
    console.log('item: ', item);
    if (!item) {
      return; // exit early if item is null or undefined
    }
    const quantity = item.get('quantity').value;
    console.log('quantity: ', quantity);
    const price = item.get('unit').value;
    console.log('price: ', price);
    const total = quantity * price;
    console.log('total: ', total);
    item.get('total').patchValue(total);
    console.log('item: ', item);
    this.subTotal = items.controls.reduce((acc, curr) => acc + curr.get('total').value, 0);
    this.addTax()
    // this.subTotal = items.controls.reduce((acc, curr) => acc + curr.get('total').value, 0);
    // this.taxAmount = items.controls.reduce((acc, curr) => acc + ((curr.get('total').value * curr.get('taxPercentage').value) / 100), 0);
    // this.totalAmount = this.subTotal + this.taxAmount;
    // const taxAmount = (total * taxPercentage) / 100;
    // item.controls.taxAmount.setValue(Number(taxAmount.toFixed(2)))
    // item.controls.tax.setValue(+item.controls.tax.value);
  }

  addTax(){
    console.log('this.subTotal: ', this.subTotal);
    this.CGSTTaxAmount = (this.subTotal * (this.createBillForm.value.CGSTPercentage / 100))
    this.SGSTTaxAmount = (this.subTotal * (this.createBillForm.value.SGSTPercentage / 100))
    this.IGSTTaxAmount = (this.subTotal * (this.createBillForm.value.IGSTPercentage / 100))

    this.totalAmountWithTax = this.subTotal + this.CGSTTaxAmount + this.SGSTTaxAmount + this.IGSTTaxAmount
    this.amountInWords = toWords.convert(this.totalAmountWithTax);
    console.log('amountInWords: ', this.amountInWords);
  }

  addItem(): void {
    const control = <FormArray>this.createBillForm.get('items');
    control.push(this.initItem());
    // this.items.push(this.fb.group({
    //   product: [''],
    //   quantity: [1],
    //   price: [0.00],
    //   tax: [0],
    //   total: [0],
    //   taxAmount: [0]
    // }));
  }
  removeItem(index: number): void {
    const control = <FormArray>this.createBillForm.get('items');
    control.removeAt(index);
  }
}
