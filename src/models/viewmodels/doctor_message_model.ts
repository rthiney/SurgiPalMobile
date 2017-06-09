export class DoctorMessageModel {
    id?: number; 
    userId?: number; 
    subject?: string; 
    message?: string; 
    createdAt?: Date; 
    viewed?: boolean; 
    senderId?: number; 
    doctorDataId?: number; 
    hosptalDataId?: number; 
    email?: string; 
    DoctorName?: string;
    DoctorImage?: string;
    HospitalName?: string;
    HospitalEmail?: string;
}