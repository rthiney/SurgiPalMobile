

export class SurgeryMetrics { 
    cards?: Array<string> = [];
    surgeryType?: Array<string> = [];
    cptCodes?: Array<string> = [];
    speciality?: Array<string> = [];
    admissionStatus?: Array<string> = [];
    diagnosisCodes?: Array<string> = [];
    uniqueDiag?: any= [];
    uniqueCpt?: any = []; 
    pending:number=0;
    today:number=0;
}
export class MessageMetrics {
    read?: number = 0;
    unread?: number = 0;
}
 