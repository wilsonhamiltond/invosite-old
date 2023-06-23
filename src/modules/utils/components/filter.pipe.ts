import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'filter' })
export class FilterPipe implements PipeTransform {
    transform(items: any[], property: string, query: string): any {
        return (items || []).filter(item => {
            if(!item[property])
                return true;
            item = item[property].toString();
            return item.toLowerCase().indexOf(query.toLowerCase()) !== -1
        });
    }
}