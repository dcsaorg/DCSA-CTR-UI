import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of, tap, throwError} from 'rxjs';
import {ParsedCTRRecord, PlatformRecord} from '../models/records';
import shajs from 'sha.js';
import {v4 as uuidv4} from 'uuid';


@Injectable({
  providedIn: 'root'
})
export class CtrService {

  private state: Map<string, BehaviorSubject<ParsedCTRRecord[]>> = new Map();
  private records: Map<string, ParsedCTRRecord> = new Map();

  constructor() {}

  private requiredRecord(eblID: string, recordID: string, recordTable: Map<string, ParsedCTRRecord>): ParsedCTRRecord {
    const record= recordTable.get(recordID);
    if (!record || record.parsedPlatformRecord.eblID !== eblID) {
      throw new Error("Unknown record or the record is not valid for this eBL");
    }
    return record;
  }

  postRecord(record: PlatformRecord): Observable<ParsedCTRRecord> {
    let parsedCTRRecord;
    const eblID = record.eblID;
    const existingRecords$ = this.state.get(eblID);
    const existingRecords: ParsedCTRRecord[] = existingRecords$?.value ?? [];
    try {
      parsedCTRRecord = this.generatePlatformRecord(record, existingRecords, this.records);
    } catch (e) {
      return throwError(() => e);
    }

    // Use an observable to ensure nothing happens unless someone subscribes
    // (to closer match how the service will work with proper API integration)
    return of(parsedCTRRecord).pipe(
      tap(record => {
        this.records.set(record.recordID, record);
        if (!existingRecords$) {
          const state = new BehaviorSubject<ParsedCTRRecord[]>([record]);
          this.state.set(eblID, state);
        } else  {
          const newRecords = [...existingRecords];
          newRecords.push(record);
          existingRecords$.next(newRecords);
        }
      })
    );
  }

  generatePlatformRecord(record: PlatformRecord, existingRecords: ParsedCTRRecord[], recordTable: Map<string, ParsedCTRRecord>): ParsedCTRRecord {
    const eblID = record.eblID
    const previousRecord = record.previousRecord ? recordTable.get(record.previousRecord) : undefined;
    const inResponseToRecord = record.inResponseToRecord ? this.requiredRecord(eblID, record.inResponseToRecord, recordTable) : undefined;
    const canonicalRecord = record.canonicalRecord ? this.requiredRecord(eblID, record.canonicalRecord, recordTable) : undefined;

    let recordNumber = 1;
    if (existingRecords.length < 1) {
      if (record.previousRecord) {
        throw new Error("Conflict: Bad previous previousRecord (should have been empty)");
      }
    } else if (existingRecords.length > 0 && !record.previousRecord) {
      throw new Error("Conflict: Bad previous previousRecord (should have been present)");
    } else {
      if (existingRecords[existingRecords.length - 1].recordID !== record.previousRecord) {
        throw new Error("Conflict: Bad previous previousRecord (does not match)");
      } else {
        recordNumber = existingRecords[existingRecords.length - 1].recordNumber + 1;
      }
    }
    const sha256HashFunc = shajs('sha256');
    // TODO: Create a proper signed record and checksum it, so the record ID is correct.
    // - for now a UUID is used as a placeholder.
    const recordID = sha256HashFunc.update(uuidv4()).digest('hex');
    return {
      recordID: recordID,
      recordNumber,
      insertedAtTimestamp: new Date(),
      insertedBy: record.actor,
      parsedPlatformRecord: {
        eblID,
        action: record.action,
        actor: record.actor,
        receiver: record.receiver,
        platformActionTimestamp: new Date(record.platformActionTimestamp),
        lastEnvelopeTransferChainEntrySignedContentChecksum: record.lastEnvelopeTransferChainEntrySignedContentChecksum,
        inResponseToRecord,
        canonicalRecord,
        previousRecord,
      }
    }
  }

  getRecordsForEBL(eblID: string): Observable<ParsedCTRRecord[]> {
    let v$ = this.state.get(eblID);
    console.log(`Fetching state for ${eblID}`)
    if (!v$) {
      console.log(`No eBL with that ID:`, this.state)
      return of([]);
    }
    return of(v$.value);
  }

  /* UI Only features */

  ctrRecordStream$(eblID: string): Observable<ParsedCTRRecord[]> {
    let stream$ = this.state.get(eblID);
    if (!stream$) {
      stream$ = new BehaviorSubject<ParsedCTRRecord[]>([]);
      this.state.set(eblID, stream$);
    }
    return stream$;
  }

  hasEbl(eblID: string): boolean {
    const stream$= this.state.get(eblID);
    return !!stream$ && stream$.value.length > 0;
  }
}
