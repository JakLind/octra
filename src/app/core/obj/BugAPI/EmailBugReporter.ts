import {BugReporter} from './BugReporter';
import {Observable} from 'rxjs/Observable';
import {isArray} from 'rxjs/util/isArray';
import {HttpClient, HttpResponse} from '@angular/common/http';

export class EmailBugReporter extends BugReporter {
  constructor() {
    super();
    this._name = 'Email';
  }

  public sendBugReport(http: HttpClient, pkg: any, form: any, url: string,
                       auth_token: string, sendbugreport: boolean): Observable<HttpResponse<any>> {

    const report = (sendbugreport) ? this.getText(pkg) : '';

    const json = pkg;

    const body = {
      description: form.description,
      additional_information: {
        email: form.email
      },
      os: json.system.os.name,
      os_build: json.system.os.version,
      platform: json.system.browser,
      version: json.octra.version,
      report: report
    };

    return http.post(url, JSON.stringify(body), {
      headers: {
        Authorization: auth_token
      },
      observe: 'response',
      responseType: 'json'
    });
  }

  public getText(pkg: any): string {
    let result = '';

    for (const attr in pkg) {
      if (pkg.hasOwnProperty(attr)) {
        if (!isArray(pkg[attr]) && typeof pkg[attr] === 'object') {
          result += attr + '\n';
          result += '---------\n';

          for (const attr2 in pkg[attr]) {
            if (pkg[attr].hasOwnProperty(attr2) && typeof pkg[attr][attr2] !== 'object' || pkg[attr][attr2] === null) {
              result += '  ' + attr2 + ':  ' + pkg[attr][attr2] + '\n';
            }
          }
        } else if (isArray(pkg[attr])) {
          result += attr + '\n';
          result += '---------\n';

          for (let i = 0; i < pkg[attr].length; i++) {
            if (typeof pkg[attr][i].message === 'string') {
              result += '  ' + pkg[attr][i].type + '  ' + pkg[attr][i].message + '\n';
            } else if (typeof pkg[attr][i].message === 'object') {
              result += '  ' + pkg[attr][i].type + '\n' + JSON.stringify(pkg[attr][i].message, null, 2) + '\n';
            }
          }
        }
        result += '\n';
      }
    }

    return result;
  }
}
