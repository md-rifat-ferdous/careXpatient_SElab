export const appointments = [
  { id:1, patientName:"J. Smith",      type:"Checkup",           time:"09:00 AM", status:"completed", isOnline:false, duration:"30 min" },
  { id:2, patientName:"Marcus Johnson",type:"Video Consultation", time:"11:30 AM", status:"confirmed", isOnline:true,  duration:"45 min" },
  { id:3, patientName:"Sarah Williams",type:"In-Person",          time:"02:00 PM", status:"confirmed", isOnline:false, duration:"60 min", room:"Room 302" }
];

export const requests = [
  { id:101, patientName:"Michael Chang",  type:"Post-op checkup", time:"10:30 AM", status:"pending" },
  { id:102, patientName:"Emily Roberts",  type:"Routine checkup", time:"11:15 AM", status:"pending" }
];

export const stats = { pending:12, confirmed:5, cancelled:48 };

