import {HttpErrorResponse} from '@angular/common/http';

export class ErrorExtractor {
  static extractErrorMessage(error: any) {
    //how can I check the error type?
    if(error == HttpErrorResponse) {
      
    }
  }
}
