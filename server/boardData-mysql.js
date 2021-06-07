/**
 *                  WHITEBOPHIR SERVER
 *********************************************************
 * @licstart  The following is the entire license notice for the
 *  JavaScript code in this page.
 *
 * Copyright (C) 2013-2014  Ophir LOJKINE
 *
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.  The code is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 * As additional permission under GNU GPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 * @licend
 * @module boardData
 * @author Will
 * @date 2021-06-07 12:47:44
 */

const { BoardData } = require('./boardData')

const knex = require('knex')({
  client: 'mysql',
  connection: {
    host : '127.0.0.1',
    user : 'root',
    password : 'root',
    database : 'mm-site-d0'
  }
});


class BoardDataMysql extends BoardData {

  /** Reads data from the board
   * @param {string} id - Identifier of the element to get.
   * @returns {BoardElem} The element with the given id, or undefined if no element has this id
   */
  get(id) {
    return this.board[id];
  }

  /** Reads data from the board
   * @param {string} [id] - Identifier of the first element to get.
   * @returns {BoardElem[]}
   */
  getAll(id) {
    return Object.entries(this.board)
      .filter(([i]) => !id || i > id)
      .map(([_, elem]) => elem);
  }

  /** Save the board to disk without preventing multiple simultaneaous saves. Use save() instead */
  async _unsafe_save() {
    this.lastSaveDate = Date.now();
    this.clean();
    var file = this.file;
    var tmp_file = backupFileName(file);
    var board_txt = JSON.stringify(this.board);
    if (board_txt === "{}") {
      // empty board
      try {
        await fs.promises.unlink(file);
        log("removed empty board", { name: this.name });
      } catch (err) {
        if (err.code !== "ENOENT") {
          // If the file already wasn't saved, this is not an error
          log("board deletion error", { err: err.toString() });
        }
      }
    } else {
      try {
        await fs.promises.writeFile(tmp_file, board_txt, { flag: "wx" });
        await fs.promises.rename(tmp_file, file);
        log("saved board", {
          name: this.name,
          size: board_txt.length,
          delay_ms: Date.now() - this.lastSaveDate,
        });
      } catch (err) {
        log("board saving error", {
          err: err.toString(),
          tmp_file: tmp_file,
        });
        return;
      }
    }
  }
}

module.exports.BoardDataMysql = BoardDataMysql
