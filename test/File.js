var Stream = require('stream');
var fs = require('fs');
var path = require('path');
var es = require('event-stream');
var File = require('../');

var should = require('should');
require('mocha');

describe('File', function() {
  describe('isVinyl()', function() {
    it('should return true on a vinyl object', function(done) {
      var file = new File();
      File.isVinyl(file).should.equal(true);
      done();
    });
    it('should return false on a normal object', function(done) {
      File.isVinyl({}).should.equal(false);
      done();
    });
    it('should return false on a null object', function(done) {
      File.isVinyl(null).should.equal(false);
      done();
    });
  });
  describe('constructor()', function() {
    it('should default cwd to process.cwd', function(done) {
      var file = new File();
      file.cwd.should.equal(process.cwd());
      done();
    });

    it('should default base to cwd', function(done) {
      var cwd = '/';
      var file = new File({ cwd: cwd });
      file.base.should.equal(cwd);
      done();
    });

    it('should default base to cwd even when none is given', function(done) {
      var file = new File();
      file.base.should.equal(process.cwd());
      done();
    });

    it('should default path to null', function(done) {
      var file = new File();
      should.not.exist(file.path);
      done();
    });

    it('should default history to []', function(done) {
      var file = new File();
      file.history.should.eql([]);
      done();
    });

    it('should default stat to null', function(done) {
      var file = new File();
      should.not.exist(file.stat);
      done();
    });

    it('should default contents to null', function(done) {
      var file = new File();
      should.not.exist(file.contents);
      done();
    });

    it('should set base to given value', function(done) {
      var val = '/';
      var file = new File({ base: val });
      file.base.should.equal(val);
      done();
    });

    it('should set cwd to given value', function(done) {
      var val = '/';
      var file = new File({ cwd: val });
      file.cwd.should.equal(val);
      done();
    });

    it('should set path to given value', function(done) {
      var val = '/test.coffee';
      var file = new File({ path: val });
      file.path.should.equal(val);
      file.history.should.eql([val]);
      done();
    });

    it('should set history to given value', function(done) {
      var val = '/test.coffee';
      var file = new File({ history: [val] });
      file.path.should.equal(val);
      file.history.should.eql([val]);
      done();
    });

    it('should set stat to given value', function(done) {
      var val = {};
      var file = new File({ stat: val });
      file.stat.should.equal(val);
      done();
    });

    it('should set contents to given value', function(done) {
      var val = new Buffer('test');
      var file = new File({ contents: val });
      file.contents.should.equal(val);
      done();
    });
  });

  describe('isBuffer()', function() {
    it('should return true when the contents are a Buffer', function(done) {
      var val = new Buffer('test');
      var file = new File({ contents: val });
      file.isBuffer().should.equal(true);
      done();
    });

    it('should return false when the contents are a Stream', function(done) {
      var val = new Stream();
      var file = new File({ contents: val });
      file.isBuffer().should.equal(false);
      done();
    });

    it('should return false when the contents are a null', function(done) {
      var file = new File({ contents: null });
      file.isBuffer().should.equal(false);
      done();
    });
  });

  describe('isStream()', function() {
    it('should return false when the contents are a Buffer', function(done) {
      var val = new Buffer('test');
      var file = new File({ contents: val });
      file.isStream().should.equal(false);
      done();
    });

    it('should return true when the contents are a Stream', function(done) {
      var val = new Stream();
      var file = new File({ contents: val });
      file.isStream().should.equal(true);
      done();
    });

    it('should return false when the contents are a null', function(done) {
      var file = new File({ contents: null });
      file.isStream().should.equal(false);
      done();
    });
  });

  describe('isNull()', function() {
    it('should return false when the contents are a Buffer', function(done) {
      var val = new Buffer('test');
      var file = new File({ contents: val });
      file.isNull().should.equal(false);
      done();
    });

    it('should return false when the contents are a Stream', function(done) {
      var val = new Stream();
      var file = new File({ contents: val });
      file.isNull().should.equal(false);
      done();
    });

    it('should return true when the contents are a null', function(done) {
      var file = new File({ contents: null });
      file.isNull().should.equal(true);
      done();
    });
  });

  describe('isDirectory()', function() {
    var fakeStat = {
      isDirectory: function() {
        return true;
      },
    };

    it('should return false when the contents are a Buffer', function(done) {
      var val = new Buffer('test');
      var file = new File({ contents: val, stat: fakeStat });
      file.isDirectory().should.equal(false);
      done();
    });

    it('should return false when the contents are a Stream', function(done) {
      var val = new Stream();
      var file = new File({ contents: val, stat: fakeStat });
      file.isDirectory().should.equal(false);
      done();
    });

    it('should return true when the contents are a null', function(done) {
      var file = new File({ contents: null, stat: fakeStat });
      file.isDirectory().should.equal(true);
      done();
    });
  });

  describe('clone()', function() {
    it('should copy all attributes over with Buffer', function(done) {
      var options = {
        cwd: '/',
        base: '/test/',
        path: '/test/test.coffee',
        contents: new Buffer('test'),
      };
      var file = new File(options);
      var file2 = file.clone();

      file2.should.not.equal(file, 'refs should be different');
      file2.cwd.should.equal(file.cwd);
      file2.base.should.equal(file.base);
      file2.path.should.equal(file.path);
      file2.contents.should.not.equal(file.contents, 'buffer ref should be different');
      file2.contents.toString('utf8').should.equal(file.contents.toString('utf8'));
      done();
    });

    it('should copy buffer\'s reference with option contents: false', function(done) {
      var options = {
        cwd: '/',
        base: '/test/',
        path: '/test/test.js',
        contents: new Buffer('test'),
      };

      var file = new File(options);

      var copy1 = file.clone({ contents: false });
      copy1.contents.should.equal(file.contents);

      var copy2 = file.clone({});
      copy2.contents.should.not.equal(file.contents);

      var copy3 = file.clone({ contents: 'any string' });
      copy3.contents.should.not.equal(file.contents);

      done();
    });

    it('should copy all attributes over with Stream', function(done) {
      var contents = new Stream.PassThrough();
      var options = {
        cwd: '/',
        base: '/test/',
        path: '/test/test.coffee',
        contents: contents,
      };
      var file = new File(options);
      var file2 = file.clone();

      contents.write(new Buffer('wa'));

      process.nextTick(function() {
        contents.write(new Buffer('dup'));
        contents.end();
      });

      file2.should.not.equal(file, 'refs should be different');
      file2.cwd.should.equal(file.cwd);
      file2.base.should.equal(file.base);
      file2.path.should.equal(file.path);
      file2.contents.should.not.equal(file.contents, 'stream ref should not be the same');
      file.contents.pipe(es.wait(function(err, data) {
        file2.contents.pipe(es.wait(function(err, data2) {
          data2.should.not.equal(data, 'stream contents ref should not be the same');
          data2.should.eql(data, 'stream contents should be the same');
        }));
      }));
      done();
    });

    it('should copy all attributes over with null', function(done) {
      var options = {
        cwd: '/',
        base: '/test/',
        path: '/test/test.coffee',
        contents: null,
      };
      var file = new File(options);
      var file2 = file.clone();

      file2.should.not.equal(file, 'refs should be different');
      file2.cwd.should.equal(file.cwd);
      file2.base.should.equal(file.base);
      file2.path.should.equal(file.path);
      should.not.exist(file2.contents);
      done();
    });

    it('should properly clone the `stat` property', function(done) {
      var options = {
        cwd: '/',
        base: '/test/',
        path: '/test/test.js',
        contents: new Buffer('test'),
        stat: fs.statSync(__filename),
      };

      var file = new File(options);
      var copy = file.clone();

      copy.stat.isFile().should.equal(true);
      copy.stat.isDirectory().should.equal(false);
      should(file.stat instanceof fs.Stats).equal(true);
      should(copy.stat instanceof fs.Stats).equal(true);

      done();
    });

    it('should properly clone the `history` property', function(done) {
      var options = {
        cwd: '/',
        base: '/test/',
        path: '/test/test.js',
        contents: new Buffer('test'),
        stat: fs.statSync(__filename),
      };

      var file = new File(options);
      var copy = file.clone();

      copy.history[0].should.equal(options.path);
      copy.path = 'lol';
      file.path.should.not.equal(copy.path);
      done();
    });

    it('should copy custom properties', function(done) {
      var options = {
        cwd: '/',
        base: '/test/',
        path: '/test/test.coffee',
        contents: null,
      };

      var file = new File(options);
      file.custom = { a: 'custom property' };

      var file2 = file.clone();

      file2.should.not.equal(file, 'refs should be different');
      file2.cwd.should.equal(file.cwd);
      file2.base.should.equal(file.base);
      file2.path.should.equal(file.path);
      file2.custom.should.not.equal(file.custom);
      file2.custom.a.should.equal(file.custom.a);

      done();
    });

    it('should copy history', function(done) {
      var options = {
        cwd: '/',
        base: '/test/',
        path: '/test/test.coffee',
        contents: null,
      };

      var file = new File(options);
      file.path = '/test/test.js';
      file.path = '/test/test-938di2s.js';
      var file2 = file.clone();

      file2.history.should.eql([
        '/test/test.coffee',
        '/test/test.js',
        '/test/test-938di2s.js',
      ]);
      file2.history.should.not.equal([
        '/test/test.coffee',
        '/test/test.js',
        '/test/test-938di2s.js',
      ]);
      file2.path.should.eql('/test/test-938di2s.js');

      done();
    });

    it('should copy all attributes deeply', function(done) {
      var options = {
        cwd: '/',
        base: '/test/',
        path: '/test/test.coffee',
        contents: null,
      };

      var file = new File(options);
      file.custom = { a: 'custom property' };

      var file2 = file.clone(true);
      file2.custom.should.eql(file.custom);
      file2.custom.should.not.equal(file.custom);
      file2.custom.a.should.equal(file.custom.a);

      var file3 = file.clone({ deep: true });
      file3.custom.should.eql(file.custom);
      file3.custom.should.not.equal(file.custom);
      file3.custom.a.should.equal(file.custom.a);

      var file4 = file.clone(false);
      file4.custom.should.eql(file.custom);
      file4.custom.should.equal(file.custom);
      file4.custom.a.should.equal(file.custom.a);

      var file5 = file.clone({ deep: false });
      file5.custom.should.eql(file.custom);
      file5.custom.should.equal(file.custom);
      file5.custom.a.should.equal(file.custom.a);

      done();
    });
  });

  describe('pipe()', function() {
    it('should write to stream with Buffer', function(done) {
      var options = {
        cwd: '/',
        base: '/test/',
        path: '/test/test.coffee',
        contents: new Buffer('test'),
      };
      var file = new File(options);
      var stream = new Stream.PassThrough();
      stream.on('data', function(chunk) {
        should.exist(chunk);
        (chunk instanceof Buffer).should.equal(true, 'should write as a buffer');
        chunk.toString('utf8').should.equal(options.contents.toString('utf8'));
      });
      stream.on('end', function() {
        done();
      });
      var ret = file.pipe(stream);
      ret.should.equal(stream, 'should return the stream');
    });

    it('should pipe to stream with Stream', function(done) {
      var testChunk = new Buffer('test');
      var options = {
        cwd: '/',
        base: '/test/',
        path: '/test/test.coffee',
        contents: new Stream.PassThrough(),
      };
      var file = new File(options);
      var stream = new Stream.PassThrough();
      stream.on('data', function(chunk) {
        should.exist(chunk);
        (chunk instanceof Buffer).should.equal(true, 'should write as a buffer');
        chunk.toString('utf8').should.equal(testChunk.toString('utf8'));
        done();
      });
      var ret = file.pipe(stream);
      ret.should.equal(stream, 'should return the stream');

      file.contents.write(testChunk);
    });

    it('should do nothing with null', function(done) {
      var options = {
        cwd: '/',
        base: '/test/',
        path: '/test/test.coffee',
        contents: null,
      };
      var file = new File(options);
      var stream = new Stream.PassThrough();
      stream.on('data', function() {
        throw new Error('should not write');
      });
      stream.on('end', function() {
        done();
      });
      var ret = file.pipe(stream);
      ret.should.equal(stream, 'should return the stream');
    });

    it('should write to stream with Buffer', function(done) {
      var options = {
        cwd: '/',
        base: '/test/',
        path: '/test/test.coffee',
        contents: new Buffer('test'),
      };
      var file = new File(options);
      var stream = new Stream.PassThrough();
      stream.on('data', function(chunk) {
        should.exist(chunk);
        (chunk instanceof Buffer).should.equal(true, 'should write as a buffer');
        chunk.toString('utf8').should.equal(options.contents.toString('utf8'));
        done();
      });
      stream.on('end', function() {
        throw new Error('should not end');
      });
      var ret = file.pipe(stream, { end: false });
      ret.should.equal(stream, 'should return the stream');
    });

    it('should pipe to stream with Stream', function(done) {
      var testChunk = new Buffer('test');
      var options = {
        cwd: '/',
        base: '/test/',
        path: '/test/test.coffee',
        contents: new Stream.PassThrough(),
      };
      var file = new File(options);
      var stream = new Stream.PassThrough();
      stream.on('data', function(chunk) {
        should.exist(chunk);
        (chunk instanceof Buffer).should.equal(true, 'should write as a buffer');
        chunk.toString('utf8').should.equal(testChunk.toString('utf8'));
        done();
      });
      stream.on('end', function() {
        throw new Error('should not end');
      });
      var ret = file.pipe(stream, { end: false });
      ret.should.equal(stream, 'should return the stream');

      file.contents.write(testChunk);
    });

    it('should do nothing with null', function(done) {
      var options = {
        cwd: '/',
        base: '/test/',
        path: '/test/test.coffee',
        contents: null,
      };
      var file = new File(options);
      var stream = new Stream.PassThrough();
      stream.on('data', function() {
        throw new Error('should not write');
      });
      stream.on('end', function() {
        throw new Error('should not end');
      });
      var ret = file.pipe(stream, { end: false });
      ret.should.equal(stream, 'should return the stream');
      process.nextTick(done);
    });
  });

  describe('inspect()', function() {
    it('should return correct format when no contents and no path', function(done) {
      var file = new File();
      file.inspect().should.equal('<File >');
      done();
    });

    it('should return correct format when Buffer and no path', function(done) {
      var val = new Buffer('test');
      var file = new File({
        contents: val,
      });
      file.inspect().should.equal('<File <Buffer 74 65 73 74>>');
      done();
    });

    it('should return correct format when Buffer and relative path', function(done) {
      var val = new Buffer('test');
      var file = new File({
        cwd: '/',
        base: '/test/',
        path: '/test/test.coffee',
        contents: val,
      });
      file.inspect().should.equal('<File "test.coffee" <Buffer 74 65 73 74>>');
      done();
    });

    it('should return correct format when Buffer and only path and no base', function(done) {
      var val = new Buffer('test');
      var file = new File({
        cwd: '/',
        path: '/test/test.coffee',
        contents: val,
      });
      delete file.base;
      file.inspect().should.equal('<File "/test/test.coffee" <Buffer 74 65 73 74>>');
      done();
    });

    it('should return correct format when Stream and relative path', function(done) {
      var file = new File({
        cwd: '/',
        base: '/test/',
        path: '/test/test.coffee',
        contents: new Stream.PassThrough(),
      });
      file.inspect().should.equal('<File "test.coffee" <PassThroughStream>>');
      done();
    });

    it('should return correct format when null and relative path', function(done) {
      var file = new File({
        cwd: '/',
        base: '/test/',
        path: '/test/test.coffee',
        contents: null,
      });
      file.inspect().should.equal('<File "test.coffee">');
      done();
    });
  });

  describe('contents get/set', function() {
    it('should work with Buffer', function(done) {
      var val = new Buffer('test');
      var file = new File();
      file.contents = val;
      file.contents.should.equal(val);
      done();
    });

    it('should work with Stream', function(done) {
      var val = new Stream.PassThrough();
      var file = new File();
      file.contents = val;
      file.contents.should.equal(val);
      done();
    });

    it('should work with null', function(done) {
      var val = null;
      var file = new File();
      file.contents = val;
      (file.contents === null).should.equal(true);
      done();
    });

    it('should not work with string', function(done) {
      var val = 'test';
      var file = new File();
      try {
        file.contents = val;
      } catch (err) {
        should.exist(err);
        done();
      }
    });
  });

  describe('relative get/set', function() {
    it('should error on set', function(done) {
      var file = new File();
      try {
        file.relative = 'test';
      } catch (err) {
        should.exist(err);
        done();
      }
    });

    it('should error on get when no base', function(done) {
      var a;
      var file = new File();
      delete file.base;
      try {
        a = file.relative;
      } catch (err) {
        should.exist(err);
        done();
      }
    });

    it('should error on get when no path', function(done) {
      var a;
      var file = new File();
      try {
        a = file.relative;
      } catch (err) {
        should.exist(err);
        done();
      }
    });

    it('should return a relative path from base', function(done) {
      var file = new File({
        cwd: '/',
        base: '/test/',
        path: '/test/test.coffee',
      });
      file.relative.should.equal('test.coffee');
      done();
    });

    it('should return a relative path from cwd', function(done) {
      var file = new File({
        cwd: '/',
        path: '/test/test.coffee',
      });
      file.relative.should.equal(path.join('test','test.coffee'));
      done();
    });
  });

  describe('dirname get/set', function() {
    it('should error on get when no path', function(done) {
      var a;
      var file = new File();
      try {
        a = file.dirname;
      } catch (err) {
        should.exist(err);
        done();
      }
    });

    it('should return the dirname of the path', function(done) {
      var file = new File({
        cwd: '/',
        base: '/test/',
        path: '/test/test.coffee',
      });
      file.dirname.should.equal('/test');
      done();
    });

    it('should error on set when no path', function(done) {
      var file = new File();
      try {
        file.dirname = '/test';
      } catch (err) {
        should.exist(err);
        done();
      }
    });

    it('should set the dirname of the path', function(done) {
      var file = new File({
        cwd: '/',
        base: '/test/',
        path: '/test/test.coffee',
      });
      file.dirname = '/test/foo';
      file.path.should.equal('/test/foo/test.coffee');
      done();
    });
  });

  describe('basename get/set', function() {
    it('should error on get when no path', function(done) {
      var a;
      var file = new File();
      try {
        a = file.basename;
      } catch (err) {
        should.exist(err);
        done();
      }
    });

    it('should return the basename of the path', function(done) {
      var file = new File({
        cwd: '/',
        base: '/test/',
        path: '/test/test.coffee',
      });
      file.basename.should.equal('test.coffee');
      done();
    });

    it('should error on set when no path', function(done) {
      var file = new File();
      try {
        file.basename = 'test.coffee';
      } catch (err) {
        should.exist(err);
        done();
      }
    });

    it('should set the basename of the path', function(done) {
      var file = new File({
        cwd: '/',
        base: '/test/',
        path: '/test/test.coffee',
      });
      file.basename = 'foo.png';
      file.path.should.equal('/test/foo.png');
      done();
    });
  });

  describe('stem get/set', function() {
    it('should error on get when no path', function(done) {
      var a;
      var file = new File();
      try {
        a = file.stem;
      } catch (err) {
        should.exist(err);
        done();
      }
    });

    it('should return the stem of the path', function(done) {
      var file = new File({
        cwd: '/',
        base: '/test/',
        path: '/test/test.coffee',
      });
      file.stem.should.equal('test');
      done();
    });

    it('should error on set when no path', function(done) {
      var file = new File();
      try {
        file.stem = 'test.coffee';
      } catch (err) {
        should.exist(err);
        done();
      }
    });

    it('should set the stem of the path', function(done) {
      var file = new File({
        cwd: '/',
        base: '/test/',
        path: '/test/test.coffee',
      });
      file.stem = 'foo';
      file.path.should.equal('/test/foo.coffee');
      done();
    });
  });

  describe('extname get/set', function() {
    it('should error on get when no path', function(done) {
      var a;
      var file = new File();
      try {
        a = file.extname;
      } catch (err) {
        should.exist(err);
        done();
      }
    });

    it('should return the extname of the path', function(done) {
      var file = new File({
        cwd: '/',
        base: '/test/',
        path: '/test/test.coffee',
      });
      file.extname.should.equal('.coffee');
      done();
    });

    it('should error on set when no path', function(done) {
      var file = new File();
      try {
        file.extname = '.coffee';
      } catch (err) {
        should.exist(err);
        done();
      }
    });

    it('should set the extname of the path', function(done) {
      var file = new File({
        cwd: '/',
        base: '/test/',
        path: '/test/test.coffee',
      });
      file.extname = '.png';
      file.path.should.equal('/test/test.png');
      done();
    });
  });

  describe('path get/set', function() {

    it('should record history when instantiation', function() {
      var file = new File({
        cwd: '/',
        path: '/test/test.coffee',
      });

      file.path.should.eql('/test/test.coffee');
      file.history.should.eql(['/test/test.coffee']);
    });

    it('should record history when path change', function() {
      var file = new File({
        cwd: '/',
        path: '/test/test.coffee',
      });

      file.path = '/test/test.js';
      file.path.should.eql('/test/test.js');
      file.history.should.eql(['/test/test.coffee', '/test/test.js']);

      file.path = '/test/test.coffee';
      file.path.should.eql('/test/test.coffee');
      file.history.should.eql(['/test/test.coffee', '/test/test.js', '/test/test.coffee']);
    });

    it('should not record history when set the same path', function() {
      var file = new File({
        cwd: '/',
        path: '/test/test.coffee',
      });

      file.path = '/test/test.coffee';
      file.path = '/test/test.coffee';
      file.path.should.eql('/test/test.coffee');
      file.history.should.eql(['/test/test.coffee']);

      // Ignore when set empty string
      file.path = '';
      file.path.should.eql('/test/test.coffee');
      file.history.should.eql(['/test/test.coffee']);
    });

    it('should throw when set path null', function() {
      var file = new File({
        cwd: '/',
        path: null,
      });

      should.not.exist(file.path);
      file.history.should.eql([]);

      (function() {
        file.path = null;
      }).should.throw('path should be string');
    });
  });
});
