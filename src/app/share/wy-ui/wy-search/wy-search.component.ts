import { Component, OnInit, Input, TemplateRef, ViewChild, ElementRef, AfterViewInit, Output, EventEmitter, OnChanges, SimpleChanges, ViewContainerRef } from '@angular/core';
import { fromEvent } from 'rxjs';
import { pluck, debounceTime, distinctUntilChanged } from 'rxjs/internal/operators';
import { SearchResult } from '../../../services/data-types/common.types';
import { isEmptyObject } from 'src/app/utils/tools';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { WySearchPanelComponent } from './wy-search-panel/wy-search-panel.component';

@Component({
  selector: 'app-wy-search',
  templateUrl: './wy-search.component.html',
  styleUrls: ['./wy-search.component.less']
})
export class WySearchComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() customView: TemplateRef<any>;
  @Input() searchResult: SearchResult;
  @Input() connectedRef: ElementRef;
  @Output() onSearch = new EventEmitter<string>();


  private overlayRef: OverlayRef;


  @ViewChild('search') private defaultRef: ElementRef;
  @ViewChild('nzInput') private nzInput: ElementRef;
  constructor(
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef
  ) {}

  ngOnInit() {
  }

  ngAfterViewInit() {
    fromEvent(this.nzInput.nativeElement, 'input')
    .pipe(debounceTime(300), distinctUntilChanged(), pluck('target', 'value'))
    .subscribe((value: string) => {
      this.onSearch.emit(value);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.searchResult && !changes.searchResult.firstChange) {
      if (!isEmptyObject(this.searchResult)) {
        this.showOverlayPanel();
      } else {
        this.showOverlayPanel();
      }
    }
  }

  onFocus() {
    if (this.searchResult && !isEmptyObject(this.searchResult)) {
      this.showOverlayPanel();
    }
  }

  onBlur() {
    this.hideOverlayPanel();
  }

  showOverlayPanel() {
    this.hideOverlayPanel();
    const positionStrategy = this.overlay.position()
    .flexibleConnectedTo(this.connectedRef || this.defaultRef)
    .withPositions([{
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top'
    }]).withLockedPosition(true);
    this.overlayRef = this.overlay.create({
      // hasBackdrop: true,
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition()
    });
    const panelPortal = new ComponentPortal(WySearchPanelComponent, this.viewContainerRef);
    const panelRef = this.overlayRef.attach(panelPortal);
    panelRef.instance.searchResult = this.searchResult;
    this.overlayRef.backdropClick().subscribe(() => {
      this.hideOverlayPanel();
    });
  }


  hideOverlayPanel() {
    if (this.overlayRef && this.overlayRef.hasAttached) {
      this.overlayRef.dispose();
    }
  }

}
