
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
    IN = "IN",
    NO = "NO"
}

export enum Interaction {
    L = "L",
    D = "D"
}

export class FilterInput {
    keyword?: string;
    genEdTypes?: GenEdType[];
    dayOfWeeks?: DayOfWeek[];
    limit?: number;
    offset?: number;
}

export class CourseGroupInput {
    semester: string;
    academicYear: string;
    studyProgram: StudyProgram;
}

export class CreateReviewInput {
    rating: number;
    courseNo: string;
    semester: string;
    academicYear: string;
    studyProgram: StudyProgram;
    content?: string;
}

export class AccessTokenDTO {
    accessToken: string;
    _id: string;
    firstName: string;
}

export abstract class IMutation {
    abstract verify(code: string, redirectURI: string): AccessTokenDTO | Promise<AccessTokenDTO>;

    abstract createReview(createReviewInput: CreateReviewInput): Review | Promise<Review>;

    abstract removeReview(reviewId: string): Review | Promise<Review>;

    abstract setInteraction(reviewId: string, interaction: Interaction): Review | Promise<Review>;
}

export class Period {
    start: string;
    end: string;
}

export class ExamPeriod {
    date: Date;
    period: Period;
}

export class Capacity {
    current: number;
    max: number;
}

export class Class {
    type: ClassType;
    dayOfWeek?: DayOfWeek;
    period?: Period;
    building?: string;
    room?: string;
    teachers: string[];
}

export class Section {
    sectionNo: string;
    closed: boolean;
    capacity: Capacity;
    note?: string;
    classes: Class[];
}

export class Course {
    studyProgram: StudyProgram;
    semester: string;
    academicYear: string;
    courseNo: string;
    abbrName: string;
    courseNameTh: string;
    courseNameEn: string;
    faculty: string;
    credit: number;
    creditHours: string;
    courseCondition: string;
    genEdType: GenEdType;
    midterm?: ExamPeriod;
    final?: ExamPeriod;
    sections: Section[];
    rating?: number;
}

export abstract class IQuery {
    abstract courses(): Course[] | Promise<Course[]>;

    abstract course(courseNo: string, courseGroup: CourseGroupInput): Course | Promise<Course>;

    abstract search(filter: FilterInput, courseGroup: CourseGroupInput): Course[] | Promise<Course[]>;

    abstract reviews(courseNo: string, studyProgram: StudyProgram): Review[] | Promise<Review[]>;

    abstract me(): User | Promise<User>;

    abstract users(): User[] | Promise<User[]>;
}

export class Review {
    _id: string;
    rating: number;
    courseNo: string;
    semester: string;
    academicYear: string;
    studyProgram: StudyProgram;
    content?: string;
    likeCount: number;
    dislikeCount: number;
    myInteraction?: Interaction;
}

export class User {
    _id: string;
    email: string;
    firstName?: string;
    lastName?: string;
}
