import {Inject, Injectable} from '@angular/core';
import {ServiceModule} from "../service.module";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Song, SongUrl, Lyric, SongSheet} from "../data-modals/common.models";
import {Observable} from "rxjs/index";
import {map} from "rxjs/internal/operators";
import {API_CONFIG} from "../../core/inject-tokens";


@Injectable({
  providedIn: ServiceModule
})
export class SongService {
  constructor(private http: HttpClient, @Inject(API_CONFIG) private config: string) { }
  
  // 歌单详情
  getSongSheetDetail(id: number): Observable<SongSheet> {
    const params = new HttpParams().set('id', id.toString());
    return this.http.get(this.config + 'playlist/detail', { params })
      .pipe(
        map((res: {playlist: SongSheet}) => res.playlist));
  }
  
  // 歌曲url列表
  getSongUrl(id: string): Observable<SongUrl[]> {
    const params = new HttpParams().set('id', id);
    return this.http.get(this.config + 'song/url', { params })
      .pipe(map((res: {data: SongUrl[]}) => res.data));
  }
  
  // 歌曲详情
  getSongDetail(id: string): Observable<Song> {
    const params = new HttpParams().set('ids', id);
    return this.http.get(this.config + 'song/detail', { params })
      .pipe(map((res: {songs: Song[]}) => res.songs[0]));
  }


    // 歌词
 getLyric(id: number): Observable<Lyric> {
    const params = new HttpParams().set('id', id.toString());
    return this.http.get(this.config + 'lyric', { params })
      .pipe(
        map((res: { [type: string]: {lyric: string} }) => {
          return {
            lyric: res.lrc.lyric,
            tlyric: res.tlyric.lyric
          }
        }));
  }


  getSongList(songs: Song | Song[]): Observable<Song[]> {
    const songArr = Array.isArray(songs) ? songs : [songs];
    return Observable.create(observer => {
      const ids = songArr.map(item => item.id).join(',');
        this.getSongUrl(ids).subscribe(urls => {
          observer.next(this.generateSongList(songArr, urls));
        });
    });
  }


  private generateSongList(songs: Song[], urls: SongUrl[]): Song[] {
    const result = [];
    songs.forEach(song => {
      const url = <string>urls.find(url => url.id === song.id).url;
      result.push({
        id: song.id,
        name: song.name,
        ar: song.ar,
        al: song.al,
        dt: song.dt,
        url
      });
    });
    return result;
  }
}
