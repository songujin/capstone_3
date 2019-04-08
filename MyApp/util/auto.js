/**
 * Created by krinmayu on 2017-04-19.
 */

let simpleGit = require('simple-git')
let fs = require('fs-extra')
let glob = require('glob')
let path = require('path')
let fileName = 'package.json'
let execSync = require('child_process').execSync

function relaseExist () {
  fs.access('release', function (err) {
    if (err) {
      createRelease()
    } else {
      fs.remove('release', function () {
        createRelease()
      })
    }
  })
}

function createRelease () {
  let url = 'git@github.com:OBIGOGIT/obigo-sdk-ojsf-starter-kit.git'
  console.log('start createRelease')
  simpleGit().clone(url, 'release', ['--depth', '1', '-b', 'release/publish'], createMaster)
}

function createMaster () {
  let url = 'git@github.com:OBIGOGIT/obigo-sdk-ojsf-starter-kit.git'
  console.log('end createRelease')
  console.log('start createMaster')
  simpleGit().clone(url, 'master', ['--depth', '1'], overwrite)
}

function overwrite () {
  console.log('end createMaster')
  console.log('start overwrite')
  fs.readdir('release', function modifyrRelese (err, list) {
    let i
    let length = list.length
    for (i = 0; i < length; i++) {
      if (list[i] === '.git') {
        continue
      }
      else {
        fs.remove('./release/' + list[i])
      }
    }
    modifyMaster()
  })
}

function modifyMaster () {
  console.log('end overwrite')
  console.log('start modifyMaster')
  fs.remove('./master/.git', function () {
    fs.copy('master', 'release', function () {
      fs.remove('master', searchKey)
    })
  })
}

function searchKey () {
  process.chdir('release')
  fs.readFile(fileName, 'utf8', function (err, data) {
    if (process.argv[3] === undefined) {
      createCore()
    }
    else {
      let regex = '(' + 'version' + ')(\\W+)(\\S+)(")',
        reg = new RegExp(regex, 'gi')
      let result = data.replace(reg, function (match, p1, p2, p3, p4) {
        p3 = process.argv[3]
        let file = p1.concat(p2, p3, p4)
        return file
      })
      fs.writeFile(fileName, result, createCore)
    }
  })
}

function createCore () {
  let root = './obigo_update/js_core'
  let url = 'git@github.com:OBIGOGIT/obigo-sdk-ojsf-vue.git'
  let data = 'dist\nsrc\ntypes\npackage.json'
  init(root, url, data)
}

function createUi () {
  let root = './obigo_update/js_ui'
  let url = 'git@github.com:OBIGOGIT/obigo-sdk-ojsf-obigo-ui.git'
  let data = 'dist\nsrc\npackage.json'
  init(root, url, data)
}

function createWebapi () {
  let root = './obigo_update/js_webapi'
  let url = 'git@github.com:OBIGOGIT/obigo-sdk-ojsf-webapi.git'
  let data = '*'
  init(root, url, data)
}

function init (root, url, data) {
  fs.mkdirp(root, function () {
    process.chdir(root)
    simpleGit().init(0, function () {
      fs.writeFile('.git/info/sparse-checkout', data, function () {
        simpleGit().addConfig('core.sparseCheckout', 'true', function () {
          simpleGit().addRemote('origin', url, build)
        })
      })
    })
  })
}

function build () {
  simpleGit().fetch(['--tags'], function () {
    simpleGit().tags({'--sort': '-creatordate'}, function (err, tags) {
      simpleGit().checkoutBranch('test', tags.latest, pack)
    })
  })
}

function pack () {
  execSync('npm pack')
  makeObigolib()
}

function makeObigolib (err, outfile) {
  process.chdir('../..')
  glob('obigo_update/**/*.tgz', '', function (err, files) {
    fs.move(files[0], './obigo_lib/' + path.basename(files[0]), function () {
      glob('obigo_lib/**/*.tgz', '', function (err, results) {
        if (results.length === 1)
          createUi()
        else if (results.length === 2)
          createWebapi()
        else
          changePackage()
      })
    })
  })
}

function changePackage () {
  glob('obigo_lib/**/*.tgz', '', function (err, files) {
    fs.readFile(fileName, 'utf8', function (err, data) {
      files.forEach(function (v, i) {
        let strArray = v.split('/')
        let category = strArray[1].split('-', 3)
        let regex = '(' + category[0] + '-' + category[1] + '-' + category[2] + ')(\\W+)(\\S+)(\\")'
        let reg = new RegExp(regex, 'gi')
        let file = data.replace(reg, function (match, p1, p2, p3, p4) {
          p3 = 'file:' + v
          let result = p1.concat(p2, p3, p4)
          return result
        })
        data = file
      }) //files.forEach end
      fs.writeFile(fileName, data, optionCheck)
    })
  })
}

function optionCheck () {
  let isExist = process.argv.indexOf('-t')
  if (isExist !== -1) {
    return 0
  }
  else {
    inputCommitmessage()
  }
}

function inputCommitmessage () {
  simpleGit().add('./*', function () {
    simpleGit().commit('build Test', function () {
      console.log('commit complete')
      simpleGit().push('origin', 'release/publish', getVersion)
    })
  })
}

function getVersion () {
  fs.readFile(fileName, 'utf8', function (err, data) {
    if (err) throw err
    let re = /version(?:\D*)(\d+\D\d+\D\d+)/i
    let result = data.match(re)
    addTag(result)
  })
}

function addTag (result) {
  simpleGit().addTag('ide-v' + result[1], function (err) {
    if (err) {
      simpleGit().addTag('ide-v' + result[1] + '3', function (err) {
        console.log(err)
      })
    }
    simpleGit().push('origin', 'ide-v' + result[1], function () {
      console.log('push tags')
    })
  })
}

relaseExist()
