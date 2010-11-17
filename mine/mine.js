function $ (element) {
    return document.getElementById(element);
}

(function mine_game() {

ImagesFactory = function () {
    this.image = $('images-all');
    this.get = function (request) {
        switch(request) {
            case 'normal':
                return {
                    x: 0,
                    y: 0,
                    xwidth: 400,
                    ywidth: 400
                };
                break;

            case 'hover':
                return {
                    x: 400,
                    y: 0,
                    xwidth: 400,
                    ywidth: 400
                };
                break;

            case 'flag':
                return {
                    x: 1600,
                    y: 0,
                    xwidth: 400,
                    ywidth: 400
                };
                break;

            case 'mine':
                return {
                    x: 1200,
                    y: 0,
                    xwidth: 400,
                    ywidth: 400
                };
                break;

            case 'number':
                var r = [];
                r.push({
                    x: 800,
                    y: 0,
                    xwidth: 400,
                    ywidth: 400,
                });
                for(var i = 0; i < 8; i++) {
                    r.push({
                        x: 2000 + i*400,
                        y: 0,
                        xwidth: 400,
                        ywidth: 400,
                    });
                }
                return r;
        }
    };
}

Vector = function (x, y) {
    this.x = x;
    this.y = y;
    
    this.toString = function (){
        return "x = " + x + ", y = " + y;
    }
}

Mine = function () {
    this.rows = $('rows').value || 10;
    this.cols = $('cols').value || 10;
    this.imageFactory = new ImagesFactory();
    this.block_width = 30;
    this.mine_count = $('mines').value || 20;
    if(this.mine_count > this.rows*this.cols)
        this.mine_count = this.rows*this.cols-1;
    
    this.ctx = $('canvas').getContext('2d');
    this.canvas_width = $('canvas').width;
    this.canvas_height = $('canvas').height;
    this.canvas_x_offset =
        (this.canvas_width - this.block_width*this.rows)/2;
    this.canvas_y_offset =
        (this.canvas_height - this.block_width*this.cols)/2;
    
    this.last_block_over;
    this.blocks = this.makeBlocks();
    
    this.draw_map(this.ctx);
    
};

Mine.prototype.draw_map = function (ctx) {
    for(i=0; i<this.rows; i++){
        for(j=0; j<this.cols; j++){
            /*
            ctx.strokeRect(
                this.block_width*i + this.canvas_x_offset,
                this.block_width*j + this.canvas_y_offset,
                this.block_width,
                this.block_width
            );*/
            image = this.imageFactory.get('normal');
            ctx.drawImage(
                this.imageFactory.image,
                image.x,
                image.y,
                image.xwidth,
                image.ywidth,
                this.block_width*i + this.canvas_x_offset,
                this.block_width*j + this.canvas_y_offset,
                this.block_width,
                this.block_width
            );
        }
    }
}

Mine.prototype.clear = function () {
    this.ctx.clearRect(
        0,0,400,400
    );
}

Block = function (game, x, y) {
    // game reference
    this.ref = game;
    
    // block coordenation
    this.coor = new Vector(x, y);
    
    this.revealed = false;
    this.flagged = false;
    this.over = false;
    this.mined = false;
    this.number = 0;
    this.neightboors;
    
    this.reveal = function () {
        if(this.revealed) return;

        this.revealed = true;
        ctx = this.ref.ctx;
        if(this.mined)
            image = this.ref.imageFactory.get('mine');
        else
            image = this.ref.imageFactory.get('number')[this.number];

        ctx.drawImage(
            this.ref.imageFactory.image,
            image.x,
            image.y,
            image.xwidth,
            image.ywidth,
            this.coor.x*this.ref.block_width + this.ref.canvas_x_offset,
            this.coor.y*this.ref.block_width + this.ref.canvas_y_offset,
            this.ref.block_width,
            this.ref.block_width
        );
    }
    
    this.flag = function () {
        this.flagged = true;
        ctx = this.ref.ctx;
        image = this.ref.imageFactory.get('flag');
        ctx.drawImage(
            this.ref.imageFactory.image,
            image.x,
            image.y,
            image.xwidth,
            image.ywidth,
            this.coor.x*this.ref.block_width + this.ref.canvas_x_offset,
            this.coor.y*this.ref.block_width + this.ref.canvas_y_offset,
            this.ref.block_width,
            this.ref.block_width
        );
    }
    
    // highlight or no
    this.turn_on = function () {
        if(this.revealed) return;
        ctx = this.ref.ctx;
        image = this.ref.imageFactory.get('hover');
        ctx.drawImage(
            this.ref.imageFactory.image,
            image.x,
            image.y,
            image.xwidth,
            image.ywidth,
            this.coor.x*this.ref.block_width + this.ref.canvas_x_offset,
            this.coor.y*this.ref.block_width + this.ref.canvas_y_offset,
            this.ref.block_width,
            this.ref.block_width
        );
    }
    
    this.turn_off = function () {
        if(this.revealed) return;
        image = this.ref.imageFactory.get('normal');
        ctx = this.ref.ctx;
        ctx.drawImage(
            this.ref.imageFactory.image,
            image.x,
            image.y,
            image.xwidth,
            image.ywidth,
            this.coor.x*this.ref.block_width + this.ref.canvas_x_offset,
            this.coor.y*this.ref.block_width + this.ref.canvas_y_offset,
            this.ref.block_width,
            this.ref.block_width
        );
        
        if(this.flagged)
            this.flag();
    }
    
    this.toString = function() {
        return this.coor.toString();
    }
}

Block.prototype.makeNeightboors = function (blocks) {
    game = this.ref;
    coor = this.coor;
    
    this.neightboors = [];
    neightboors = this.neightboors;
    
    // get top neightboor
    if(coor.y-1 >= 0) {
        neightboors.push(blocks[coor.x][coor.y-1]);
        if(coor.x-1 >= 0)
            neightboors.push(blocks[coor.x-1][coor.y-1]);
        if(coor.x+1 < game.rows)
            neightboors.push(blocks[coor.x+1][coor.y-1]);
    }
    
    // get left and right neightboors
    if(coor.x-1 >= 0)
        neightboors.push(blocks[coor.x-1][coor.y]);
    if(coor.x+1 < game.rows)
        neightboors.push(blocks[coor.x+1][coor.y]);
    
    // get bottom neightboor
    if(coor.y+1 < game.cols) {
        neightboors.push(blocks[coor.x][coor.y+1]);
        if(coor.x-1 >= 0)
            neightboors.push(blocks[coor.x-1][coor.y+1]);
        if(coor.x+1 < game.rows)
            neightboors.push(blocks[coor.x+1][coor.y+1]);
    }
}

Block.prototype.revealNeightboors = function () {

    var to_reveal = [];
    var current;
    to_reveal.push(this);

    while(to_reveal.length > 0){
        console.log('aidjaijd');
        current = to_reveal.shift();

        // conta quantas bandeiras foram colocadas
        var bombs = 0, wrong_mark = false;
        for(n in current.neightboors){
            if(current.neightboors[n].flagged){
                bombs++;
                if(!current.neightboors[n].mined)
                    wrong_mark = true;
            }
        }
        
        if(bombs >= current.number && wrong_mark){
            this.ref.gameover();        // game over
            return;
        }
        
        if(bombs == current.number){
            for(var n in current.neightboors){
                // Empilha os proximos a serem revelados
                if(current.neightboors[n].number == 0 && !current.neightboors[n].revealed)
                    to_reveal.push(current.neightboors[n]);

                if(!current.neightboors[n].mined)
                    current.neightboors[n].reveal();
            }
        }
    }

}

Mine.prototype.mapCanvas = function(e) {
    mouse_coor = new Vector(e.offsetX, e.offsetY);
    
    block = this.getBlockByCoor(mouse_coor);
    if(block == null){
        if(this.last_block_over != null)
            this.last_block_over.turn_off();
    }
    else {
        if(!block.clicked && !block.flagged){
            block.turn_on();
            if(block != this.last_block_over) {
                if(this.last_block_over != null)
                    this.last_block_over.turn_off();
                this.last_block_over = block;
            }
        }
    }
}

Mine.prototype.mapClick = function(e) {
    mouse_coor = new Vector(e.offsetX, e.offsetY);
        
    block = this.getBlockByCoor(mouse_coor);
    if(block != null){
        if(!block.revealed){
            block.reveal();
            if(block.number == 0){
                block.revealNeightboors();
            }
        }
        else {
            block.revealNeightboors();
        }
    }
}

Mine.prototype.mapFlag = function(e) {
    mouse_coor = new Vector(e.offsetX, e.offsetY);
        
    block = this.getBlockByCoor(mouse_coor);
    if(block != null){
        block.flag();
    }
}

Mine.prototype.makeBlocks = function() {
    var blocks = [];
    var to_mine = [];
    
    // inicia os blocos e cria o vetor que pode ter as minas
    for(i=0; i<this.rows; i++){
        blocks[i] = [];
        for(j=0; j<this.cols; j++){
            blocks[i][j] = new Block(this,i,j);
            to_mine.push(blocks[i][j]);
        }
    }
    
    // inicia os vizinhos dos blocos
    for(i=0; i<this.rows; i++){
        for(j=0; j<this.cols; j++){
            blocks[i][j].makeNeightboors(blocks);
        }
    }
    
    for(i=0; i<this.mine_count; i++){
        mine_place = Math.floor(Math.random()*to_mine.length);
        mined = to_mine[mine_place];
        mined.mined = true;
        for(n in mined.neightboors)
            mined.neightboors[n].number++;
        to_mine.splice(mine_place, 1);
    }
    
    return blocks;
}

Mine.prototype.getBlockByCoor = function (coor) {
    x = coor.x - this.canvas_x_offset;
    y = coor.y - this.canvas_y_offset;
    
    vector = new Vector(x, y);
    
    row = parseInt(vector.x / this.block_width);
    col = parseInt(vector.y / this.block_width);
    
    if(row >= 0 && col >= 0 && row < this.rows
        && col < this.cols)
        return this.blocks[row][col];
    else
        return null;
}

}());

function fieldsVerify() {
    fields = ['rows', 'cols', 'mines'];
    for(i in fields){
        if($(fields[i]).value <= 0){
            $(fields[i]).value = 1;
        }
        if(fields[i] != 'mines' && $(fields[i]).value > 13){
            $(fields[i]).value = 13;
        }
    }
}

window.onload = function () {
    mine = new Mine();
    $('canvas').addEventListener('mousemove', function (e) {
        mine.mapCanvas.call(mine, e);
    }, false);
    $('canvas').addEventListener('click', function (e) {
        mine.mapClick.call(mine, e);
    }, false);
    $('canvas').addEventListener('contextmenu', function (e) {
        mine.mapFlag.call(mine, e);
        e.cancelBubble = true;
        e.stopPropagation();
        e.preventDefault();
    }, false);
    $('go').onclick = function (e) {
        mine.clear();
        fieldsVerify();
        mine = new Mine();
    }
}
