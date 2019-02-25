import { Component } from '@angular/core';
declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  imgs = [
    { url: 'https://images.pexels.com/photos/723240/pexels-photo-723240.jpeg' },
    {
      url:
        'https://images.pexels.com/photos/46160/field-clouds-sky-earth-46160.jpeg'
    },
    { url: 'https://images.pexels.com/photos/215/road-sky-clouds-cloudy.jpg' },
    {
      url: 'https://images.pexels.com/photos/1166209/pexels-photo-1166209.jpeg'
    },
    { url: 'https://a.radikal.ru/a15/1902/af/60e2b65e3674.png' }
  ];
  currentImgSrc = { url: '' };
  mouse = {
    x: 0,
    y: 0,
    startX: 0,
    startY: 0
  };

  closeModal() {
    this.mouse = {
      x: 0,
      y: 0,
      startX: 0,
      startY: 0
    };
    $('.rectangle').remove();
    $('.txt-input').remove();
  }

  showModal(ev) {
    $('#modal').modal('show');
    this.currentImgSrc.url = ev.target.src;
    const canvas = $('#imgCanvas')[0];
    const img = new Image();
    const ctx = canvas.getContext('2d');
    const canvasCopy = document.createElement('canvas');
    const copyctx = canvasCopy.getContext('2d');
    img.src = ev.target.src;
    img.onload = function() {
      let ratio = 1;
      const maxWidth = 900;
      const maxHeight = 600;

      if (img.width > maxWidth) {
        ratio = maxWidth / img.width;
      } else if (img.height > maxHeight) {
        ratio = maxHeight / img.height;
      }

      canvasCopy.width = img.width;
      canvasCopy.height = img.height;
      copyctx.drawImage(img, 0, 0);

      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      ctx.drawImage(
        canvasCopy,
        0,
        0,
        canvasCopy.width,
        canvasCopy.height,
        0,
        0,
        canvas.width,
        canvas.height
      );
    };
  }

  cutImg() {
    const that = this;
    const canvas = $('#imgCanvas')[0];
    const ctx = canvas.getContext('2d');
    const widthX = this.mouse.x - this.mouse.startX;
    const heihgtY = this.mouse.y - this.mouse.startY;
    const imgData = ctx.getImageData(
      this.mouse.startX,
      this.mouse.startY,
      widthX,
      heihgtY
    );
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(imgData, 0, 0);
    $('.rectangle').remove();
    canvas.onclick = null;
  }

  initDraw(canvas) {
    const that = this;
    const modalBody = $('#modal-body')[0];
    function setMousePosition(e) {
      const ev = e || window.event;
      mouse.x = ev.offsetX;
      mouse.y = ev.offsetY;
    }

    let element = null;
    const mouse = {
      x: 0,
      y: 0,
      startX: 0,
      startY: 0
    };
    // if (modalBody.onclick !== null) {
    //   modalBody.onclick = null;
    // }

    canvas.onmousemove = function(e) {
      setMousePosition(e);
      if (element !== null) {
        element.style.width = Math.abs(mouse.x - mouse.startX) + 'px';
        element.style.height = Math.abs(mouse.y - mouse.startY) + 'px';
        element.style.left =
          mouse.x - mouse.startX < 0 ? mouse.x + 'px' : mouse.startX + 'px';
        element.style.top =
          mouse.y - mouse.startY < 0 ? mouse.y + 'px' : mouse.startY + 'px';
      }
    };

    canvas.onclick = function(e) {
      if (element !== null) {
        element = null;
        canvas.style.cursor = 'default';
        canvas.onmousemove = function() {};
        that.mouse = mouse;
        console.log('finsihed.', mouse);
      } else {
        console.log('begun.');
        mouse.startX = mouse.x;
        mouse.startY = mouse.y;
        element = document.createElement('div');
        element.className = 'rectangle';
        element.style.border = '1px solid #FF0000';
        element.style.position = 'absolute';
        element.style.left = mouse.x + 'px';
        element.style.top = mouse.y + 'px';

        modalBody.appendChild(element);
        canvas.style.cursor = 'crosshair';
      }
    };
  }

  getTxtInput(ev) {
    const modalBody = $('#modal-body')[0];
    let cellText = null;
    modalBody.onclick = function(ev) {
      console.log(cellText)
      if (cellText == null) {
        cellText = $('<textarea/>');
        cellText[0].className = 'txt-input';
        cellText[0].style.position = 'absolute';
        cellText[0].style.left = ev.offsetX + 'px';
        cellText[0].style.top = ev.offsetY + 'px';
        cellText[0].style.width = '200px';
        cellText[0].style.color = 'red';
        cellText[0].style['background-color'] = 'inherit';
        modalBody.append(cellText[0]);
      }
    };
  }

  saveTxt() {
    const inputsArr = $('.txt-input');
    const canvas = $('#imgCanvas')[0];
    const ctx = canvas.getContext('2d');
    for (let i = 0; i < inputsArr.length; i++) {
      const element = inputsArr[i];
      if (element.value !== '') {
        ctx.lineWidth = 1;
        ctx.fillStyle = 'red';
        ctx.lineStyle = '#ffff00';
        ctx.font = '18px sans-serif';
        const pos = $('.txt-input').position();

        const printAt = function(context, text, x, y, lineHeight, fitWidth) {
          fitWidth = fitWidth || 0;

          if (fitWidth <= 0) {
            context.fillText(text, x, y);
            return;
          }

          for (let idx = 1; idx <= text.length; idx++) {
            const str = text.substr(0, idx);
            // console.log(str, context.measureText(str).width, fitWidth);
            if (context.measureText(str).width > fitWidth) {
              context.fillText(text.substr(0, idx - 1), x, y);
              printAt(
                context,
                text.substr(idx - 1),
                x,
                y + lineHeight,
                lineHeight,
                fitWidth
              );
              return;
            }
          }
          context.fillText(text, x, y);
        };
        printAt(ctx, element.value, pos.left, pos.top + 18, 15, 200 );
      }
      element.remove();
    }
    $('#modal-body')[0].onclick = null;
  }
}
