
/** ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export enum DayOfWeek {
    MO = "MO",
    TU = "TU",
    WE = "WE",
    TH = "TH",
    FR = "FR",
    SA = "SA",
    SU = "SU"
}

export enum StudyProgram {
    S = "S",
    T = "T",
    I = "I"
}

export enum ClassType {
    LECT = "LECT",
    LAB = "LAB",
    DISC = "DISC",
    FWK = "FWK",
    PRAC = "PRAC",
    IDPS = "IDPS",
    SMNA = "SMNA"
}

export enum GenEdType {
    SO = "SO",
    SC = "SC",
    HU = "HU",
    IN = "IN"
}

export class VerifyDTO {
    accessToken: string;
    _id: string;
    firstName: string;
}

export abstract class IMutation {
    abstract verify(code: string, redirectURI: string): VerifyDTO | Promise<VerifyDTO>;
}

export class Period {
    start?: string;
    end?: string;
}

export class ExamPeriod {
    date?: Date;
    period?: Period;
}

export class Capacity {
    current?: number;
    max?: number;
}

export class Class {
    type?: ClassType;
    dayOfWeek?: DayOfWeek;
    period?: Period;
    building?: string;
    room?: string;
    teacher?: string;
}

export class Section {
    sectionNo?: string;
    closed?: boolean;
    capacity?: Capacity;
    note?: string;
    classes?: Class[];
}

export class Course {
    studyProgram?: StudyProgram;
    semester?: string;
    academicYear?: string;
    courseNo?: string;
    abbrName?: string;
    courseNameTh?: string;
    courseNameEn?: string;
    faculty?: string;
    credit?: number;
    creditHours?: string;
    courseCondition?: string;
    genEdType?: GenEdType;
    midterm?: ExamPeriod;
    final?: ExamPeriod;
    sections?: Section[];
}

export abstract class IQuery {
    abstract courses(): Course[] | Promise<Course[]>;

    abstract course(id: number): Course | Promise<Course>;

    abstract me(): User | Promise<User>;

    abstract users(): User[] | Promise<User[]>;
}

export class TimetableCourse {
    courseNo: string;
    sectionNo: string;
    isVisible: boolean;
}

export class Timetable {
    semester: string;
    academicYear: string;
    studyProgram: StudyProgram;
    name: string;
    courses: TimetableCourse[];
}

export class User {
    _id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    timetables: Timetable[];
}
