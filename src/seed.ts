import type { CVDocument, CVEntry } from './model';
const e = (id:string,heading:string,subheading:string,period:string,body=''):CVEntry => ({id,heading,subheading,period,body,image:''});
export const initialDocument: CVDocument = {
  version:1, name:'Michael Meier', title:'System Development Engineer · ADAS & AD',
  email:'m-michi@gmx.net',phone:'+49 151 64504165',address:'Kothauer Str. 54 · 85053 Ingolstadt',
  summary:'Systementwicklung für Fahrerassistenz und automatisiertes Fahren. Schwerpunkte: prädiktive Funktionen, modellbasierte Systementwicklung und die Integration und Erprobung am Fahrzeug.',
  photo:'',links:[],
  design:{template:'nordic',color:'#1e6b68',font:'sans',density:'comfortable',photoShape:'rounded',showPhoto:true},
  sections:[
    {id:'experience',title:'Beruflicher Werdegang',kind:'experience',icon:'briefcase',visible:true,entries:[
      e('cariad','CARIAD SE','System Development Engineer im Bereich ADAS & AD','seit 11/2021',
        'Funktionsentwicklung prädiktiver Features (insbesondere Tempolimitassistent) ACA im PPE/PPC E³ 1.2 Premium\nVerantwortlicher für MBSE-Entwicklungsmethodik als Teamarchitekt in der Wirkkette Prädiktives Fahren\nSystemauslegung, Anforderungsspezifikation und Systemmodellierung prädiktiver Funktionsumfänge nach MBSE\nReview von Testfällen zur Durchführung funktionaler Tests an SiL und HiL\nIntegration und Inbetriebnahme der prädiktiven Wirkkette an Versuchsfahrzeugen\nDurchführung von Testfahrten sowie Analyse von Auffälligkeiten und Systemverhalten\nAuslegung der Applizierbarkeit sowie Applikation des Features Tempolimitassistent\nKoordination von Entwicklungspartnern\nPartnerkomponenten-Verantwortlicher vom UnitMaster'),
      e('efs','Elektronische Fahrwerksysteme GmbH, Gaimersheim','Senior-Entwickler für Fahrerassistenzsysteme','01/2014 – 10/2021',
        'Begleitende Systementwicklung ACA LF im MLBevo2, mit Fokus auf Q8, Urus und e-tron GT\nFunktions- und Freigabetests sowie Applikation und Anforderungsanalysen von ACC, pACC und HMI\nDerivatbetreuung und Systemverifikation ACC und pre sense front im MLB und MLBevo1\nInbetriebnahme von Technikträgern sowie Erprobungsplanung und -durchführung im In- und Ausland'),
      e('gigatronic','Gigatronik Ingolstadt GmbH, Gaimersheim','Technischer Angestellter','11/2009 – 12/2013'),
      e('modl-job','Modl GmbH, Pappenheim','Elektromechaniker','02/2005 – 09/2007'),
    ]},
    {id:'education',title:'Berufliche Ausbildung',kind:'education',icon:'graduation',visible:true,entries:[
      e('grundig','Grundig Akademie, Nürnberg','Staatlich geprüfter Elektrotechniker','09/2007 – 07/2009','Schwerpunkt: Datenverarbeitungstechnik'),
      e('modl-study','Modl GmbH, Pappenheim','Elektromechaniker','09/2001 – 02/2005','Auszeichnung: 1. Kammersieger und 2. Landessieger'),
    ]},
    {id:'training',title:'Weiterbildung',kind:'education',icon:'award',visible:true,entries:[
      e('th','TH Ingolstadt','Modulstudium Grundlagen Softwareentwicklung','06/2021'),
      e('ra','RA Consulting','DiagRA Anwenderschulung, ODX für Diagnoseentwicklung','09/2019'),
      e('istqb','Knowledge Department','ISTQB Certified Tester Foundation Level','11/2018'),
      e('m-training','M-Training Stiglmair','Konflikte managen im beruflichen Kontext','11/2016'),
      e('tuv','TÜV Rheinland','Qualitätsmanagement-Zertifikat','07/2009'),
    ]},
    {id:'school',title:'Schulische Ausbildung',kind:'education',icon:'graduation',visible:true,entries:[
      e('hauptschule','Hauptschule Nennslingen','Qualifizierter Hauptschulabschluss · Mittlerer Schulabschluss','09/1996 – 07/2001'),
    ]},
    {id:'skills',title:'Kenntnisse & Interessen',kind:'skills',icon:'sparkles',visible:true,entries:[
      e('measurement','Mess- und Analysetools','','','CANape, CANalyzer, CANoe, ADTF'),
      e('diagnostics','Diagnosetools','','','IDEX, ODIS, System42, CP-Tool, DiagRA'),
      e('office','Office','','','Microsoft Office'),
      e('language','Sprachen','','','Englisch in Wort und Schrift'),
      e('licences','Führerschein','','','A, B, BE'),
      e('hobbies','Interessen','','','Functional Training, Beachvolleyball, Foto- und Videobearbeitung'),
    ]},
  ],
};
