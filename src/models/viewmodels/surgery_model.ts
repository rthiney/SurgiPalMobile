import { Surgery } from '../Surgery';
 
 
export class SurgeryItem implements Surgery { 
  id: number;
  surgeryName: string;
  patientName: string;
  surgeryDate: Date;
  cptCodes: string;
        dxCodes: string;
  status: string = "new";
  isComplete: boolean = false;
  starttime: Date = null;
  endtime: Date = null;
  isBilled: boolean = false;
  imageName: string = 'person-flat.png';
  numComments: number = 11;
  constructor(
    id: number,
    surgeryName: string,
    patientName: string,
    surgeryDate: Date,
    cptCodes: string,      dxCodes: string,
    status: string = "new",
    isComplete: boolean = false,
    starttime: Date = null,
    endtime: Date = null,
    isBilled: boolean = false,
    imageName: string = 'person-flat.png',
    numComments: number = 11) {
    this.id = id;
    this.surgeryName = surgeryName;
    this.patientName = patientName;
    this.surgeryDate = surgeryDate;
    this.cptCodes = cptCodes;
    this.dxCodes=dxCodes;
    this.status = status;
    this.isComplete = isComplete;
    this.starttime = starttime;
    this.endtime = endtime;
    this.isBilled = isBilled;
    this.imageName = imageName;
    this.numComments = numComments;
  }
}
// export class SurgeryList {
//     public Id: number;
//     public Name: string;
//     public Surgeries: SurgeryItem[];
// }


 