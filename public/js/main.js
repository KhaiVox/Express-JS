function loadPage(page) {
    $.ajax({
        url: '/user?page=' + page,
        type: 'GET',
    }).then((result) => {
        // trước khi render ra list khác cần ẩn toàn bộ list cũ
        $('#content').html('')
        for (let i = 0; i < result.data.length; i++) {
            const element = result.data[i]
            var item = `<h1>${element.username}</h1>`

            $('#content').append(item)
        }
    })
}

// Pagination
// document.addEventListener: khắc phục lỗi $ của jquery
document.addEventListener('DOMContentLoaded', function() {
    // luôn hiển thị 1 trang khi load web
    loadPage(1)
    $('#paging').pagination({
        // call đến api của 1 trang bất kì để lấy giá trị total
        dataSource: '/user?page=1',
        locator: 'data',
        totalNumberLocator: function(res) {
            return res.total
        },
        pageSize: 5,
        // lấy ra vị trí page được click
        afterPageOnClick: function(e, pageNumber) {
            loadPage(pageNumber)
        },
        afterPreviousOnClick: function(e, pageNumber) {
            loadPage(pageNumber)
        },
        afterNextOnClick: function(e, pageNumber) {
            loadPage(pageNumber)
        },
    })
})

// Set Cookie
function setCookie(cname, cvalue, exdays) {
    const d = new Date()
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000)
    let expires = 'expires=' + d.toUTCString()
    document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/'
}

// Get Cookie
function getCookie(cname) {
    let name = cname + '='
    let decodedCookie = decodeURIComponent(document.cookie)
    let ca = decodedCookie.split(';')
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i]
        while (c.charAt(0) == ' ') {
            c = c.substring(1)
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length)
        }
    }
    return ''
}

function edit() {
    var token = getCookie('token')
    $.ajax({
        url: '/edit',
        method: 'POST',
        headers: {
            token,
        },
    }).then((data) => {
        console.log(data)
    })
}