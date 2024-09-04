import React from 'react'

function Test() {
    // 把 0 移到最後
    const testArr = [1, 0, 0, 0, 5, 4, 6, 0, 7]

    function moveZero(testArr: Number[]) {
        let zeroNumber = 0;

        for (let i = 0; i < testArr.length; i++) {
            if (testArr[i] !== 0) {
                testArr[zeroNumber] = testArr[i];
                zeroNumber++;
            }
        }
        while (zeroNumber < testArr.length) {
            testArr[zeroNumber] = 0;
            zeroNumber++;
        }
        return testArr
    }

    // console.log(moveZero(testArr), "===================😍😍😍")


    // 找出相差的最大值，如果沒有就return 0，過了就不能往回找
    const testArr2 = [9, 4, 6, 8, 2, 1]  // 8-4=4
    const testArr3 = [9, 6, 2, 1]  // 0

    function findMax(array: number[]) {
        if (array.length < 2) return 0;

        let minCount = array[0];
        let maxTotalCount = 0;

        for (let i = 1; i < array.length; i++) {
            if (array[i] < minCount) {
                minCount = array[i];
            } else {
                // 計算當前的最大差值
                const currentDifference = array[i] - minCount;
                if (currentDifference > maxTotalCount) {
                    maxTotalCount = currentDifference;
                }
            }

            // console.log(array[i], "======現在是", i);
            // console.log(minCount, "minCount");
            // console.log(maxTotalCount, "maxTotalCount");
        }

        return maxTotalCount;
    }
    // console.log('最大利益：', findMax(testArr2))
    // console.log('最大利益：', findMax(testArr3))



    return (
        <div>test</div>
    )
}

export default Test