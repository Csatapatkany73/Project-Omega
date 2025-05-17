document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('studyForm')
  const subjectInput = document.getElementById('subjectInput')
  const minutesInput = document.getElementById('minutesInput')
  const plannedTimeInput = document.getElementById('plannedTimeInput')
  const priorityInput = document.getElementById('priorityInput')
  const deadlineInput = document.getElementById('deadlineInput')
  const studyList = document.getElementById('studyList')
  const clearAllButton = document.getElementById('clearAllButton')
  const exportPdfButton = document.getElementById('exportPdfButton')
  const sortByPriorityButton = document.getElementById('sortByPriorityButton')
  const randomStatsButton = document.getElementById('randomStatsButton')
  const sortByDateAscButton = document.getElementById('sortByDateAscButton')
  const sortByDateDescButton = document.getElementById('sortByDateDescButton')
  const smartSortButton = document.getElementById('smartSortButton')


  let savedStudies = []
 // Űrlap küldés kezelése
  form.addEventListener('submit', (e) => {
    e.preventDefault()

    const subject = subjectInput.value.trim()
    const minutes = Number(minutesInput.value)
    const plannedTime = Number(plannedTimeInput.value)
    const priority = priorityInput.value
    const deadline = deadlineInput.value
    if (!subject || minutes <= 0 || plannedTime <= 0) return

    const studyEntry = {
      subject,
      minutes,
      plannedTime,
      priority,
      deadline,
    }
    savedStudies.push(studyEntry)
    addStudyToList(studyEntry, savedStudies.length - 1)
    subjectInput.value = ''
    minutesInput.value = ''
    plannedTimeInput.value = ''
    priorityInput.value = 'Elsődleges'
    deadlineInput.value = ''
  })

  clearAllButton.addEventListener('click', () => {
    savedStudies = []
    studyList.innerHTML = ''
  })

  exportPdfButton.addEventListener('click', () => {
    const exportData = Array.from(studyList.children).map((li, index) => {
      const isCompleted = li.querySelector('input[type="checkbox"]').checked
      const textSpan = li.querySelector('span')

     
      const text = textSpan.textContent
      const parts = text.split('–')[0].trim()
      const subject = parts

      const minutesMatch = text.match(/(\d+) perc \/ (\d+) perc/)
      const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0
      const plannedTime = minutesMatch ? parseInt(minutesMatch[2]) : 0

      const priorityMatch = text.match(/Prioritás: ([^\-]+)/)
      const priority = priorityMatch ? priorityMatch[1].trim() : ''

      const deadlineMatch = text.match(/Határidő: ([^\-]+)/)
      const deadline = deadlineMatch ? deadlineMatch[1].trim() : ''

      return {
        subject,
        minutes,
        plannedTime,
        priority,
        deadline,
        completed: isCompleted,
      }
    })

    const html = generateHTMLReport(exportData)

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tanulasi_jelentes.html'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  })

  function generateHTMLReport(entries) {
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Tanulási jelentés</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .chart-container { width: 100%; height: 300px; position: relative; margin-top: 20px; }
          .chart-bar { position: absolute; bottom: 30px; width: 40px; background-color: #4CAF50; }
          .chart-planned { position: absolute; bottom: 30px; width: 40px; background-color: #2196F3; border: 1px dashed #333; }
          .chart-label { position: absolute; bottom: 5px; width: 80px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Tanulási idő jelentés</h1>
        
        <table>
          <tr>
            <th>Tárgy</th>
            <th>Perc</th>
            <th>Tervezett</th>
            <th>%</th>
            <th>Prioritás</th>
            <th>Határidő</th>
            <th>Teljesítve</th>
          </tr>
    `

    let totalMinutes = 0
    let totalPlanned = 0

    entries.forEach((entry) => {
      const percentage =
        entry.plannedTime > 0
          ? Math.min((entry.minutes / entry.plannedTime) * 100, 100).toFixed(1)
          : '0.0'

      totalMinutes += entry.minutes
      totalPlanned += entry.plannedTime

      const formattedDeadline = formatDate(entry.deadline)

      html += `
        <tr>
          <td>${entry.subject}</td>
          <td>${entry.minutes}</td>
          <td>${entry.plannedTime}</td>
          <td>${percentage}%</td>
          <td>${entry.priority}</td>
          <td>${formattedDeadline}</td>
          <td>${entry.completed ? 'Igen' : 'Nem'}</td>
        </tr>
      `
    })

    html += `</table>`

    const totalPercentage =
      totalPlanned > 0
        ? ((totalMinutes / totalPlanned) * 100).toFixed(1)
        : '0.0'

    html += `
      <h2>Összes idő: ${totalMinutes} perc / ${totalPlanned} perc (${totalPercentage}%)</h2>
      
      <h2>Tanulási idők grafikonja</h2>
      <div class="chart-container">
    `

    const maxMinutes = Math.max(
      ...entries.map((e) => Math.max(e.minutes, e.plannedTime)),
      1
    )

    entries.forEach((entry, i) => {
      const barWidth = 40
      const spacing = 40
      const startX = i * (barWidth + spacing) + 50

      // Tényleges idő (zöld oszlop)
      const actualHeight = (entry.minutes / maxMinutes) * 250
      html += `
        <div class="chart-bar" style="left:${startX}px; height:${actualHeight}px;"></div>
      `

      // Tervezett idő (kék keret)
      const plannedHeight = (entry.plannedTime / maxMinutes) * 250
      html += `
        <div class="chart-planned" style="left:${
          startX + barWidth + 5
        }px; height:${plannedHeight}px;"></div>
      `

      // Felirat
      html += `
        <div class="chart-label" style="left:${startX}px;">${entry.subject}</div>
      `
    })

    html += `
      </div>
      
      <div style="margin-top:20px;">
        <span style="display:inline-block; width:20px; height:15px; background-color:#4CAF50; margin-right:5px;"></span> Tényleges idő
        <span style="display:inline-block; width:20px; height:15px; background-color:#2196F3; margin-left:20px; margin-right:5px; border: 1px dashed #333;"></span> Tervezett idő
      </div>
      
      <p style="margin-top:30px; font-size:12px; color:#666;">
        Exportálva: ${new Date().toLocaleString()}
      </p>
      
      </body>
      </html>
    `

    return html
  }

  // Dátum formázása olvashatóbb formára
  function formatDate(dateString) {
    if (!dateString) return ''

    const date = new Date(dateString)

    // Ellenőrizzük, hogy érvényes dátum-e
    if (isNaN(date.getTime())) return dateString

    // Magyar dátumformátum: YYYY.MM.DD (hétfő)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    const dayNames = [
      'vasárnap',
      'hétfő',
      'kedd',
      'szerda',
      'csütörtök',
      'péntek',
      'szombat',
    ]
    const dayName = dayNames[date.getDay()]

    return `${year}.${month}.${day} (${dayName})`
  }

  // Prioritás szerinti rendezés gomb kezelése
  sortByPriorityButton.addEventListener('click', () => {
    // Összegyűjtjük a listaelemeket és az adataikat
    const items = Array.from(studyList.children).map((li) => {
      const text = li.querySelector('span').textContent
      const priorityMatch = text.match(/Prioritás: ([^\-]+)/)
      const priority = priorityMatch ? priorityMatch[1].trim() : ''

      // Prioritás fontossági sorrendje
      const priorityOrder = {
        Elsődleges: 1,
        Másodlagos: 2,
        Harmadlagos: 3,
        'Nem szükséges': 4,
      }

      return {
        element: li,
        priority,
        order: priorityOrder[priority] || 999, // Ha ismeretlen prioritás, a végére kerül
      }
    })

    // Rendezzük a prioritás szerint
    items.sort((a, b) => a.order - b.order)

    // Újrarendezzük a DOM-ban
    items.forEach((item) => {
      studyList.appendChild(item.element)
    })
  })

  // Határidő szerinti növekvő rendezés gomb kezelése
  sortByDateAscButton.addEventListener('click', () => {
    // Összegyűjtjük a listaelemeket és az adataikat
    const items = Array.from(studyList.children).map((li) => {
      const text = li.querySelector('span').textContent
      const deadlineMatch = text.match(/Határidő: ([^\-]+)/)
      const deadline = deadlineMatch ? deadlineMatch[1].trim() : ''

      // Dátum kinyerése - formátum: YYYY.MM.DD (nap)
      let date = new Date(9999, 11, 31) // default távoli dátum, ha nem sikerülne a kinyerés

      if (deadline) {
        const parts = deadline.split('(')[0].trim().split('.')
        if (parts.length >= 3) {
          const year = parseInt(parts[0])
          const month = parseInt(parts[1]) - 1 // hónap 0-tól indul
          const day = parseInt(parts[2])
          if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
            date = new Date(year, month, day)
          }
        }
      }

      return {
        element: li,
        date: date,
        timestamp: date.getTime(),
      }
    })

    // Rendezzük a dátum szerint növekvő sorrendben (korábbi dátumok elöl)
    items.sort((a, b) => a.timestamp - b.timestamp)

    // Újrarendezzük a DOM-ban
    items.forEach((item) => {
      studyList.appendChild(item.element)
    })
  })

  // Határidő szerinti csökkenő rendezés gomb kezelése
  sortByDateDescButton.addEventListener('click', () => {
    // Összegyűjtjük a listaelemeket és az adataikat
    const items = Array.from(studyList.children).map((li) => {
      const text = li.querySelector('span').textContent
      const deadlineMatch = text.match(/Határidő: ([^\-]+)/)
      const deadline = deadlineMatch ? deadlineMatch[1].trim() : ''

      // Dátum kinyerése - formátum: YYYY.MM.DD (nap)
      let date = new Date(1970, 0, 1) // default régi dátum, ha nem sikerülne a kinyerés

      if (deadline) {
        const parts = deadline.split('(')[0].trim().split('.')
        if (parts.length >= 3) {
          const year = parseInt(parts[0])
          const month = parseInt(parts[1]) - 1 // hónap 0-tól indul
          const day = parseInt(parts[2])
          if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
            date = new Date(year, month, day)
          }
        }
      }

      return {
        element: li,
        date: date,
        timestamp: date.getTime(),
      }
    })

    // Rendezzük a dátum szerint csökkenő sorrendben (későbbi dátumok elöl)
    items.sort((a, b) => b.timestamp - a.timestamp)

    // Újrarendezzük a DOM-ban
    items.forEach((item) => {
      studyList.appendChild(item.element)
    })
  })

  // Okos rendezés gomb kezelése
  smartSortButton.addEventListener('click', () => {
    // Összegyűjtjük a listaelemeket és az adataikat
    const items = Array.from(studyList.children).map((li) => {
      const text = li.querySelector('span').textContent
      // Teljesítettség ellenőrzése
      const isCompleted = li.querySelector('input[type="checkbox"]').checked

      // Prioritás kinyerése
      const priorityMatch = text.match(/Prioritás: ([^\-]+)/)
      const priority = priorityMatch ? priorityMatch[1].trim() : ''

      // Prioritás fontossági sorrendje
      const priorityOrder = {
        Elsődleges: 1,
        Másodlagos: 2,
        Harmadlagos: 3,
        'Nem szükséges': 4,
      }

      // Határidő kinyerése
      const deadlineMatch = text.match(/Határidő: ([^\-]+)/)
      const deadline = deadlineMatch ? deadlineMatch[1].trim() : ''

      // Dátum kinyerése - formátum: YYYY.MM.DD (nap)
      let date = new Date(9999, 11, 31) // default távoli dátum

      if (deadline) {
        const parts = deadline.split('(')[0].trim().split('.')
        if (parts.length >= 3) {
          const year = parseInt(parts[0])
          const month = parseInt(parts[1]) - 1 // hónap 0-tól indul
          const day = parseInt(parts[2])
          if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
            date = new Date(year, month, day)
          }
        }
      }

      // Okos súlyozás kiszámítása:
      // - A határidő napokban a mai naptól (közelebbi kap kisebb értéket)
      const today = new Date()
      const daysUntilDeadline = Math.max(
        1,
        Math.ceil((date - today) / (1000 * 60 * 60 * 24))
      )

      // - Kombinált súlyozás: teljesítettség (1000 ha teljesített) + prioritás * 10 + (napok / 3)
      // Ez azt jelenti, hogy teljesített elemek mindig a lista aljára kerülnek,
      // majd azonos teljesítettségen belül a prioritás a fontosabb,
      // és azonos prioritáson belül a közelebbi határidő előrébb kerül
      const smartWeight =
        (isCompleted ? 1000 : 0) +
        priorityOrder[priority] * 10 +
        daysUntilDeadline / 3

      return {
        element: li,
        isCompleted,
        priority,
        priorityOrder: priorityOrder[priority] || 999,
        date,
        daysUntilDeadline,
        smartWeight,
      }
    })

    // Rendezzük az okos súlyozás szerint (kisebb érték = fontosabb)
    items.sort((a, b) => a.smartWeight - b.smartWeight)

    // Újrarendezzük a DOM-ban
    items.forEach((item) => {
      studyList.appendChild(item.element)
    })
  })

  // Függvény, amely hozzáad egy elemet a listához
  function addStudyToList(
    { subject, minutes, plannedTime, priority, deadline },
    index
  ) {
    let currentMinutes = minutes
    let completed = false

    const li = document.createElement('li')

    // Százalékos érték kiszámítása
    function getPercentage() {
      return Math.min((currentMinutes / plannedTime) * 100, 100).toFixed(1)
    }

    function getOverText() {
      if (currentMinutes > plannedTime) {
        const overMinutes = currentMinutes - plannedTime
        const overPercent = (
          ((currentMinutes - plannedTime) / plannedTime) *
          100
        ).toFixed(1)
        return ` (Túllépés: ${overPercent}%, ${overMinutes} perc)`
      }
      return ''
    }

    // Színes sáv létrehozása
    const progressBar = document.createElement('div')
    progressBar.style.width = '100px'
    progressBar.style.height = '10px'
    progressBar.style.marginLeft = '10px'
    progressBar.style.backgroundColor = '#ddd' // Szürke alap háttér
    progressBar.style.borderRadius = '5px'
    progressBar.style.overflow = 'hidden' // Fontos, hogy a belső elem ne lógjon ki

    const progressFill = document.createElement('div')
    progressFill.style.width = `${getPercentage()}%`
    progressFill.style.height = '100%'
    progressFill.style.backgroundColor = getProgressBarColor(getPercentage()) // Helyes szín
    progressFill.style.borderRadius = '5px'

    progressBar.appendChild(progressFill)

    // Határidő formázása olvashatóbb formára
    const formattedDeadline = formatDate(deadline)

    // Listaelem szövege
    const textSpan = document.createElement('span')
    function updateText() {
      textSpan.textContent = `${subject} – ${currentMinutes} perc / ${plannedTime} perc (${getPercentage()}%)${getOverText()} - Prioritás: ${priority} - Határidő: ${formattedDeadline}`
      progressFill.style.width = `${getPercentage()}%`
      progressFill.style.backgroundColor = getProgressBarColor(getPercentage())
      if (completed) {
        textSpan.style.textDecoration = 'line-through'
        textSpan.style.color = 'gray'
      } else {
        textSpan.style.textDecoration = ''
        textSpan.style.color = ''
      }
    }
    updateText()

    // Teljesített checkbox és felirat
    const completedContainer = document.createElement('span')
    completedContainer.style.marginLeft = '10px'

    const completedLabel = document.createElement('label')
    completedLabel.textContent = 'Teljesített: '
    completedLabel.style.marginRight = '5px'

    const completedCheckbox = document.createElement('input')
    completedCheckbox.type = 'checkbox'
    completedCheckbox.checked = false

    completedCheckbox.addEventListener('change', () => {
      completed = completedCheckbox.checked
      updateText()

      // Ha teljesítve van, letiltjuk az idő hozzáadását
      if (completed) {
        addTimeInput.disabled = true
        addTimeButton.disabled = true
        addTimeButton.style.opacity = '0.5'
        addTimeInput.style.opacity = '0.5'
      } else {
        addTimeInput.disabled = false
        addTimeButton.disabled = false
        addTimeButton.style.opacity = '1'
        addTimeInput.style.opacity = '1'
      }
    })

    completedContainer.appendChild(completedLabel)
    completedContainer.appendChild(completedCheckbox)

    // Idő hozzáadása mező és gomb
    const addTimeContainer = document.createElement('div')
    addTimeContainer.style.display = 'inline-flex'
    addTimeContainer.style.alignItems = 'center'
    addTimeContainer.style.marginLeft = '10px'
    addTimeContainer.style.gap = '6px'

    const addTimeInput = document.createElement('input')
    addTimeInput.type = 'number'
    addTimeInput.placeholder = 'Idő (perc)'
    addTimeInput.style.width = '80px'
    addTimeInput.style.padding = '4px 8px'
    addTimeInput.style.border = '1px solid #ccc'
    addTimeInput.style.borderRadius = '4px'
    addTimeInput.style.fontSize = '14px'
    addTimeInput.min = '1'

    const addTimeButton = document.createElement('button')
    addTimeButton.textContent = 'Hozzáadás'
    addTimeButton.type = 'button'
    // Az egyedi stílusok már a CSS-ben vannak definiálva

    addTimeButton.addEventListener('click', () => {
      // Csak akkor adjunk hozzá időt, ha nem teljesített
      if (!completed) {
        const addValue = Number(addTimeInput.value)
        if (!isNaN(addValue) && addValue > 0) {
          currentMinutes += addValue
          updateText()
          addTimeInput.value = ''
        }
      }
    })

    addTimeContainer.appendChild(addTimeInput)
    addTimeContainer.appendChild(addTimeButton)

    // Egyedi törlés gomb
    const deleteButton = document.createElement('button')
    deleteButton.textContent = 'Törlés'
    deleteButton.style.marginLeft = '10px'
    // Az egyedi stílusok már a CSS-ben vannak definiálva
    deleteButton.addEventListener('click', () => {
      li.remove()
    })

    li.appendChild(textSpan)
    li.appendChild(progressBar)
    li.appendChild(addTimeContainer)
    li.appendChild(completedContainer)
    li.appendChild(deleteButton)
    studyList.appendChild(li)
  }

  // Függvény a progress bar színének meghatározására
  function getProgressBarColor(percentage) {
    if (percentage <= 20) return 'red'
    if (percentage <= 40) return 'orange'
    if (percentage <= 60) return 'yellow'
    if (percentage <= 80) return 'limegreen'
    return 'green'
  }

  // Random statisztika gomb kezelése
  randomStatsButton.addEventListener('click', () => {
    // Töröljük a meglévő adatokat
    savedStudies = []
    studyList.innerHTML = ''

    // Tantárgyak listája
    const subjects = [
      'Matematika',
      'Programozás',
      'Adatbázisok',
      'Webfejlesztés',
      'Hálózatok',
      'Mesterséges intelligencia',
      'Operációs rendszerek',
      'Algoritmusok',
      'Statisztika',
      'Gépitanulás',
    ]

    // Prioritások
    const priorities = [
      'Elsődleges',
      'Másodlagos',
      'Harmadlagos',
      'Nem szükséges',
    ]

    // Random 5 elem generálása
    for (let i = 0; i < 5; i++) {
      // Random tárgy, prioritás
      const subject = subjects[Math.floor(Math.random() * subjects.length)]
      const priority = priorities[Math.floor(Math.random() * priorities.length)]

      // Random percek és tervezett idő
      const plannedTime = Math.floor(Math.random() * 120) + 30 // 30-150 perc között
      const minutes = Math.floor(Math.random() * (plannedTime * 1.5)) // 0-150% között

      // Random dátum (1-30 nap a jövőben)
      const daysToAdd = Math.floor(Math.random() * 30) + 1
      const deadline = new Date()
      deadline.setDate(deadline.getDate() + daysToAdd)
      const formattedDate = deadline.toISOString().slice(0, 10) // YYYY-MM-DD formátum

      // Új bejegyzés
      const studyEntry = {
        subject,
        minutes,
        plannedTime,
        priority,
        deadline: formattedDate,
      }

      // Hozzáadjuk és megjelenítjük
      savedStudies.push(studyEntry)
      addStudyToList(studyEntry, savedStudies.length - 1)
    }
  })
})
